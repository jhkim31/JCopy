const logger = require("./logger");
const YAML = require("yaml");
const fs = require("fs");
var {Kafka, Partitioners, logLevel} = require("kafkajs");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const {v4: uuidv4} = require("uuid");
const {createClient} = require("redis");

let config = {};

if (process.env.NODE_ENV == "develop") {
    const file = fs.readFileSync("../config.yaml", "utf8");
    config = YAML.parse(file).develop;
}
if (process.env.NODE_ENV == "production") {
    const file = fs.readFileSync("./config.yaml", "utf8");
    config = YAML.parse(file).deploy;
}

const kafka = new Kafka({
    brokers: config.kafka.brokers,
    logLevel: logLevel.ERROR,
});
const producer = kafka.producer({createPartitioner: Partitioners.LegacyPartitioner});
const consumer = kafka.consumer({groupId: config.kafka.groupid.storage});

(async () => {
    try {
        await producer.connect();
        await consumer.connect();
        logger.info("kafka connected!");
    } catch (e) {
        logger.error(`kafka disconnected ${e}`);
    }
})();

const redisUrl = `redis://${config.redis.host}:${config.redis.port}`;
const redisClient = createClient({url: redisUrl});
try {
    redisClient.connect();
    logger.info("redis connceted!");
} catch (e) {
    logger.error(`Redis disconnected ${e}`);
}
logger.info(`config  \n${YAML.stringify(config)}`);

const PROTO_FILE = config.grpc.proto.path;
const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

const pkgDefs = protoLoader.loadSync(PROTO_FILE, options);
const StorageProto = grpc.loadPackageDefinition(pkgDefs);
const gRPCServer = new grpc.Server();

gRPCServer.addService(StorageProto.StorageService.service, {
    CreateText: async (CreateTextRequest, responseCallBack) => {
        logger.debug(`gRPC Recv CreateTextRequest : ${JSON.stringify(CreateTextRequest.request)}`);
        try {
            const id = CreateTextRequest.request.id;
            const expireTime = new Date(CreateTextRequest.request.expireTime);
            const textId = uuidv4();
            logger.debug(`Set Redis ${textId} : ""`);
            await redisClient.set(textId, "", {PXAT: expireTime.getTime()});
            const CreateTextResponse = {
                id: id,
                textId: textId,
            };
            logger.debug(`gRPC Send CreateTextResponse : ${JSON.stringify(CreateTextResponse)}`);
            responseCallBack(null, CreateTextResponse);
        } catch (error) {
            logger.error(`Error Processing CreateText... RPC_ID : ${CreateTextRequest.request.id} | ${error}`);
            responseCallBack(error, null);
        }
    },

    GetText: async (GetTextRequest, responseCallBack) => {
        logger.debug(`gRPC Recv GetTextRequest : ${JSON.stringify(GetTextRequest.request)}`);
        try {
            const id = GetTextRequest.request.id;
            const textValue = await redisClient.get(GetTextRequest.request.textId);
            logger.debug(`Get Redis ${GetTextRequest.request.textId} : ${textValue}`);
            const GetTextResponse = {
                id: id,
                textValue: textValue,
            };
            logger.debug(`gRPC Send GetTextResponse : ${JSON.stringify(GetTextResponse)}`);
            responseCallBack(null, GetTextResponse);
        } catch (error) {
            logger.error(`Error Processing GetText... RPC_ID : ${GetTextRequest.request.id} | ${error}`);
            responseCallBack(error, null);
        }
    },

    GetFiles: async (GetFilesRequest, responseCallBack) => {
        logger.debug(`gRPC Recv GetFilesRequest : ${JSON.stringify(GetFilesRequest.request)}`);
        try {
            const id = GetFilesRequest.request.id;
            const textValue = await redisClient.get(GetFilesRequest.request.textId);
            logger.debug(`RPC_ID : ${id} | Get Redis Text : {${GetFilesRequest.request.textId} : ${textValue}}`);
            const fileNames = [];

            for (const fileId in GetFilesRequest.request.fileIds) {
                fileNames.push(await redisClient.get(fileId));
            }
            logger.debug(`RPC_ID : ${id} | Get Redis ${GetFilesRequest.request.fileIds} : ${fileNames}`);

            const GetFilesResponse = {
                id: id,
                textValue: textValue,
                fileNames: fileNames,
            };
            logger.debug(`gRPC Send GetFilesResponse : ${JSON.stringify(GetFilesResponse)}`);
            responseCallBack(null, GetFilesResponse);
        } catch (error) {
            logger.error(`Error Processing GetFiles... RPC_ID : ${GetFilesRequest.request.id} | ${error}`);
            responseCallBack(error, null);
        }
    },
});

async function kafkaConsumerListener() {
    await consumer.subscribe({topics: ["ChangeText"]});
    logger.debug('Kafka Subscribe Topics "ChangeText"');
    await consumer.run({
        eachMessage: async ({topic, partition, message, heartbeat, pause}) => {
            logger.debug(`Consume Message :[${topic}] ${message.value}`);
            let msg = {};
            try {
                msg = JSON.parse(message.value.toString());
            } catch (e) {
                logger.error(`Error Parsing Kafka Message ... ${e} | msg : ${message.value.toString()}`);
            }
            if (msg != {}) {
                if (topic == "ChangeText") {
                    await redisClient.set(msg.textId, msg.textValue, {KEEPTTL: true});
                    logger.debug(`Set Redis ${msg.textId} : ${msg.textValue}`);
                    const kafkaMsg = {
                        roomId: msg.roomId,
                        textId: msg.textId,
                        textValue: msg.textValue,
                        clientSession: msg.clientSession,
                    };
                    const kafkaData = {
                        topic: "TextChanged",
                        messages: [{value: JSON.stringify(kafkaMsg)}],
                    };
                    logger.debug(`Produce [Topic : TextChanged] ${JSON.stringify(kafkaMsg)}`);
                    await producer.send(kafkaData);
                }
            }
        },
    });
}

kafkaConsumerListener();

gRPCServer.bindAsync("0.0.0.0:5001", grpc.ServerCredentials.createInsecure(), (error, port) => {
    logger.info(`listening on port ${port}`);
    gRPCServer.start();
});
