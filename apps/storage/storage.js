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
    config.kafka = {};
    const kafkaFile = fs.readFileSync("../.kafkaconfig.yaml", "utf8");
    kafkaConfig = YAML.parse(kafkaFile);
    config.kafka.brokers = kafkaConfig.kafka.brokers;
    config.kafka.groupid = kafkaConfig.kafka.groupid;
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

logger.info(`[3-001-01] config  \n${YAML.stringify(config)}`);
(async () => {
    try {
        await producer.connect();
        await consumer.connect();
        logger.info("[3-002-01] kafka connected!");
    } catch (e) {
        logger.error(`[3-002-11] kafka disconnected ${e}`);
    }
})();

const redisUrl = `redis://${config.redis.host}:${config.redis.port}`;
const redisClient = createClient({url: redisUrl});
try {
    redisClient.connect();
    logger.info("[3-003-01] redis connceted!");
} catch (e) {
    logger.error(`[3-003-11] Redis disconnected ${e}`);
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
        logger.debug(`[3-102-00] gRPC Recv CreateTextRequest : ${JSON.stringify(CreateTextRequest.request)}`);
        try {
            const id = CreateTextRequest.request.id;
            const expireTime = new Date(CreateTextRequest.request.expireTime);
            const textId = 'text:' + uuidv4();
            logger.debug(`  [3-703-00] Set Redis ${textId} : ""`);
            await redisClient.set(textId, "", {PXAT: expireTime.getTime()}).then(d => {
                if (d){
                    logger.debug(`  [3-703-01] Set Redis ${textId} : ""`);
                } else {
                    logger.error(`  [3-703-51] Set Redis Error textId : ${textId}`);
                }
            });
            const CreateTextResponse = {
                id: id,
                textId: textId,
            };
            logger.debug(`[3-102-21] gRPC Send CreateTextResponse : ${JSON.stringify(CreateTextResponse)}`);
            responseCallBack(null, CreateTextResponse);
        } catch (error) {
            logger.error(`[3-102-71] Error Processing CreateText... RPC_ID : ${CreateTextRequest.request.id} | ${error}`);
            responseCallBack(error, null);
        }
    },

    GetText: async (GetTextRequest, responseCallBack) => {
        logger.debug(`[3-103-00] gRPC Recv GetTextRequest : ${JSON.stringify(GetTextRequest.request)}`);
        try {
            const id = GetTextRequest.request.id;
            const textId = GetTextRequest.request.textId
            logger.debug(`[3-704-00] Get Redis ${textId}`);
            const textValue = await redisClient.get(textId);

            const GetTextResponse = {
                id: id,
                textValue: textValue,
            };
            logger.debug(`[3-103-21] gRPC Send GetTextResponse : ${JSON.stringify(GetTextResponse)}`);
            responseCallBack(null, GetTextResponse);
        } catch (error) {
            logger.error(`[3-103-71] Error Processing GetText... RPC_ID : ${GetTextRequest.request.id} | ${error}`);
            responseCallBack(error, null);
        }
    },

    GetFiles: async (GetFilesRequest, responseCallBack) => {
        logger.debug(`[3-105-00] gRPC Recv GetFilesRequest : ${JSON.stringify(GetFilesRequest.request)}`);
        try {
            const id = GetFilesRequest.request.id;
            const textId = GetFilesRequest.request.textId;
            logger.debug(`  [3-705-00] RPC_ID : ${id} | Get Redis Text : ${textId}`);
            const textValue = await redisClient.get(textId);

            const GetFilesResponse = {
                id: id,
                textValue: textValue,
                fileNames: GetFilesRequest.request.fileIds,
            };
            logger.debug(`[3-105-21] gRPC Send GetFilesResponse : ${JSON.stringify(GetFilesResponse)}`);
            responseCallBack(null, GetFilesResponse);
        } catch (error) {
            logger.error(`[3-105-71] Error Processing GetFiles... RPC_ID : ${GetFilesRequest.request.id} | ${error}`);
            responseCallBack(error, null);
        }
    },
});

async function kafkaConsumerListener() {
    await consumer.subscribe({topics: ["ChangeText"], fromBeginning: false});
    logger.debug('[3-301-00] Kafka Subscribe Topics "ChangeText"');
    await consumer.run({
        eachMessage: async ({topic, partition, message, heartbeat, pause}) => {
            logger.debug(`[3-302-00] Consume Message :[${topic}] ${message.value}`);
            let msg = {};
            try {
                msg = JSON.parse(message.value.toString());
                logger.debug(`[3-302-01] Parsing Kafka Message : ${JSON.stringify(msg)}`);
            } catch (e) {
                logger.error(`[3-302-51] Error Parsing Kafka Message ... ${e} | msg : ${message.value.toString()}`);
            }
            if (msg != {}) {
                if (topic == "ChangeText") {
                    logger.debug(`[3-707-00] Set Redis ${msg.textId} : ${msg.textValue}`);
                    await redisClient.set(msg.textId, msg.textValue, {KEEPTTL: true}).then(d => {
                        if (d){
                            logger.debug(`  [3-707-01] Set Redis ${msg.textId} : ${msg.textValue}`);
                        } else {
                            logger.error(`  [3-707-51] Set Redis Error textId : ${msg.textId}`);
                        }
                    });
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
                    logger.debug(`  [3-202-00] Produce [Topic : TextChanged] ${JSON.stringify(kafkaMsg)}`);
                    producer.send(kafkaData).then(d => {
                        if (d){
                            logger.debug(`  [3-202-01] Produce [Topic : TextChanged] ${JSON.stringify(d)}`);
                        } else {
                            logger.error(`  [3-202-51] Produce [Topic : TextChanged] ${JSON.stringify(d)}`);
                        }
                    })
                }
            }
        },
    });
}

kafkaConsumerListener();

gRPCServer.bindAsync("0.0.0.0:15001", grpc.ServerCredentials.createInsecure(), (error, port) => {
    logger.info(`listening on port ${port}`);
    gRPCServer.start();
});
