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
logger.info(`[0001] config  \n${YAML.stringify(config)}`);
(async () => {
    try {
        await producer.connect();
        await consumer.connect();
        logger.info("[0002] kafka connected!");
    } catch (e) {
        logger.error(`[0003] kafka disconnected ${e}`);
    }
})();

const redisUrl = `redis://${config.redis.host}:${config.redis.port}`;
const redisClient = createClient({url: redisUrl});
try {
    redisClient.connect();
    logger.info("[0004] redis connceted!");
} catch (e) {
    logger.error(`[0005] Redis disconnected ${e}`);
}


const PROTO_FILE = config.grpc.proto.path;
const options = {
    keepCase: true,
    longs: Number,
    defaults: true,
    oneofs: true,
};

const pkgDefs = protoLoader.loadSync(PROTO_FILE, options);
const StorageProto = grpc.loadPackageDefinition(pkgDefs);
const gRPCServer = new grpc.Server();

gRPCServer.addService(StorageProto.StorageService.service, {
    CreateText: async (CreateTextRequest, responseCallBack) => {
        logger.debug(`[0006] gRPC Recv CreateTextRequest : ${JSON.stringify(CreateTextRequest.request)}`);
        try {
            const id = CreateTextRequest.request.id;
            const expireTime = new Date(CreateTextRequest.request.expireTime);
            const textId = 'text:' + uuidv4();
            logger.debug(`[0007] Set Redis ${textId} : ""`);
            console.log(expireTime.getTime());
            await redisClient.set(textId, "", {PXAT: expireTime.getTime()});
            const CreateTextResponse = {
                id: id,
                textId: textId,
            };
            logger.debug(`[0008] gRPC Send CreateTextResponse : ${JSON.stringify(CreateTextResponse)}`);
            responseCallBack(null, CreateTextResponse);
        } catch (error) {
            logger.error(`[0009] Error Processing CreateText... RPC_ID : ${CreateTextRequest.request.id} | ${error}`);
            responseCallBack(error, null);
        }
    },

    GetText: async (GetTextRequest, responseCallBack) => {
        logger.debug(`[0010] gRPC Recv GetTextRequest : ${JSON.stringify(GetTextRequest.request)}`);
        try {
            const id = GetTextRequest.request.id;
            const textValue = await redisClient.get(GetTextRequest.request.textId);
            logger.debug(`[0011] Get Redis ${GetTextRequest.request.textId} : ${textValue}`);
            const GetTextResponse = {
                id: id,
                textValue: textValue,
            };
            logger.debug(`[0012] gRPC Send GetTextResponse : ${JSON.stringify(GetTextResponse)}`);
            responseCallBack(null, GetTextResponse);
        } catch (error) {
            logger.error(`[0013] Error Processing GetText... RPC_ID : ${GetTextRequest.request.id} | ${error}`);
            responseCallBack(error, null);
        }
    },

    GetFiles: async (GetFilesRequest, responseCallBack) => {
        logger.debug(`[0014] gRPC Recv GetFilesRequest : ${JSON.stringify(GetFilesRequest.request)}`);
        try {
            const id = GetFilesRequest.request.id;
            const textValue = await redisClient.get(GetFilesRequest.request.textId);
            logger.debug(`[0015] RPC_ID : ${id} | Get Redis Text : {${GetFilesRequest.request.textId} : ${textValue}}`);
            const fileNames = [];

            for (const fileId in GetFilesRequest.request.fileIds) {
                fileNames.push(await redisClient.get(fileId));
            }
            logger.debug(`[0016] RPC_ID : ${id} | Get Redis ${GetFilesRequest.request.fileIds} : ${fileNames}`);

            const GetFilesResponse = {
                id: id,
                textValue: textValue,
                fileNames: fileNames,
            };
            logger.debug(`[0017] gRPC Send GetFilesResponse : ${JSON.stringify(GetFilesResponse)}`);
            responseCallBack(null, GetFilesResponse);
        } catch (error) {
            logger.error(`[0018] Error Processing GetFiles... RPC_ID : ${GetFilesRequest.request.id} | ${error}`);
            responseCallBack(error, null);
        }
    },
});

async function kafkaConsumerListener() {
    await consumer.subscribe({topics: ["ChangeText"]});
    logger.debug('[0019] Kafka Subscribe Topics "ChangeText"');
    await consumer.run({
        eachMessage: async ({topic, partition, message, heartbeat, pause}) => {
            logger.debug(`[0020] Consume Message :[${topic}] ${message.value}`);
            let msg = {};
            try {
                msg = JSON.parse(message.value.toString());
            } catch (e) {
                logger.error(`[0021] Error Parsing Kafka Message ... ${e} | msg : ${message.value.toString()}`);
            }
            if (msg != {}) {
                if (topic == "ChangeText") {
                    await redisClient.set(msg.textId, msg.textValue, {KEEPTTL: true});
                    logger.debug(`[0022] Set Redis ${msg.textId} : ${msg.textValue}`);
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
                    logger.debug(`[0023] Produce [Topic : TextChanged] ${JSON.stringify(kafkaMsg)}`);
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
