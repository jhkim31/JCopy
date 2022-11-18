const develop = process.argv[2];

const YAML = require("yaml");
const fs = require("fs");

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const {v4: uuidv4} = require("uuid");
const {createClient} = require("redis");

var config = {};
if (develop == 'develop') {
    const file = fs.readFileSync("../config.yaml", "utf8");
    console.log(file);
    config = YAML.parse(file).develop;
} else {
    const file = fs.readFileSync("./config.yaml", "utf8");
    console.log(file);
    config = YAML.parse(file).deploy;
}


var {Kafka, Partitioners} = require("kafkajs");
const kafka = new Kafka({
    brokers: config.kafka.brokers,
});
const producer = kafka.producer({createPartitioner: Partitioners.LegacyPartitioner});
const consumer = kafka.consumer({groupId: config.kafka.groupid.storage});

(async () => {
    await producer.connect();
    await consumer.connect();
})();

const redisUrl = `redis://${config.redis.host}:${config.redis.port}`;
const redisClient = createClient({url: redisUrl, legacyMode: true});

redisClient.connect();

const PROTO_FILE =  config.grpc.proto.path;
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
        try {
            const expireTime = new Date(CreateTextRequest.request.expireTime);
            const textId = uuidv4();
            await redisClient.set(textId, "", {PXAT: expireTime.getTime()});
            const CreateTextResponse = {
                textId: textId,
            };
            responseCallBack(null, CreateTextResponse);
        } catch (error) {
            responseCallBack(error, null);
        }
    },

    GetText: async (GetTextRequest, responseCallBack) => {
        try {
            const value = await redisClient.get(GetTextRequest.request.textId);

            responseCallBack(null, {textValue: value});
        } catch (error) {
            responseCallBack(error, null);
        }
    },

    GetFiles: async (GetFilesRequest, responseCallBack) => {
        try {
            const textValue = await redisClient.get(GetFilesRequest.request.textId);
            const fileNames = [];
            for (const fileId in GetFilesRequest.request.fileIds) {
                fileNames.push(await redisClient.get(fileId));
            }

            const GetFilesResponse = {
                textValue: textValue,
                fileNames: fileNames,
            };
            responseCallBack(null, GetFilesResponse);
        } catch (error) {}
    },
});

async function kafkaConsumerListener() {
    await consumer.subscribe({topics: ["ChangeText"]});
    await consumer.run({
        eachMessage: async ({topic, partition, message, heartbeat, pause}) => {
            const msg = JSON.parse(message.value.toString());

            if (topic == "ChangeText") {
                await redisClient.set(msg.textId, msg.textValue, {KEEPTTL: true});
                const kafkaMsg = {
                    topic: "TextChanged",
                    messages: [
                        {
                            value: JSON.stringify({textId: msg.textId, textValue: msg.textValue, clientSession: msg.clientSession}),
                        },
                    ],
                };
                await producer.send(kafkaMsg);
                console.log('send Storage : ', kafkaMsg);
            }
        },
    });
}

kafkaConsumerListener();

gRPCServer.bindAsync("0.0.0.0:5001", grpc.ServerCredentials.createInsecure(), (error, port) => {
    gRPCServer.start();
});
