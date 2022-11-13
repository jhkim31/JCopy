const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const {v4: uuidv4} = require("uuid");
const {createClient} = require("redis");
const client = createClient('redis://localhost:6379');

client.connect();

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
            const leftSeconds = parseInt((expireTime - new Date()) / 1000);
            const textId = uuidv4();
            await client.set(textId, '', {EX: leftSeconds});
            const CreateTextResponse = {
                textId: textId
            }
            responseCallBack(null, CreateTextResponse);
        } catch (error) {
            console.log(error)
            responseCallBack(error, null);
        }
    },

    GetText: async (GetTextRequest, responseCallBack) => {
        try {
            const value = await client.get(GetTextRequest.request.textId);
            console.log(value);
            responseCallBack(null, {textValue: value})
        } catch(error) {
            responseCallBack(error, null)
        }
    }
});


//start the Server
gRPCServer.bindAsync("127.0.0.1:5001", grpc.ServerCredentials.createInsecure(), (error, port) => {
    console.log(`listening on port ${port}`);
    gRPCServer.start();
});