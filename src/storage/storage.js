const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const {v4: uuidv4} = require("uuid");
const {createClient} = require("redis");

const kafka = require("kafka-node");
var Consumer = kafka.Consumer;
var Producer = kafka.Producer;

var kafkaClient = new kafka.KafkaClient();
var producer = new Producer(kafkaClient)
var consumer = new Consumer(kafkaClient, [{topic: "ChangeText", partition: 0}], {
    autoCommit: true,
});

const redisClient = createClient("redis://localhost:6379");

redisClient.connect();

const PROTO_FILE = __dirname + "/../proto/jcopy.proto";
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
        } catch (error) {

        }
    }
});

consumer.on("message", async (message) => {
    try {
        const msg = JSON.parse(message.value);
        if (message.topic == "ChangeText") {
            await redisClient.set(msg.textId, msg.textValue, {KEEPTTL: true});
            const kafkaMsg = { topic: 'TextChanged', messages: JSON.stringify({textId: msg.textId, textValue: msg.textValue, clientSession: msg.clientSession}), partition: 0 };
            producer.send([kafkaMsg], (err, res) => {
                if (err){
                    console.log("textChanged Error")
                } else {
                    console.log("TextChanged OK")
                }

            });
        }
    } catch (e) {

    }
});

//start the Server
gRPCServer.bindAsync("127.0.0.1:5001", grpc.ServerCredentials.createInsecure(), (error, port) => {
    gRPCServer.start();
});
