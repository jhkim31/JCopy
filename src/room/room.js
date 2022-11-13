const mongoose = require("mongoose");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

//path to our proto file
const PROTO_FILE = __dirname + "/../proto/jcopy.proto";
//options needed for loading Proto file
const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

const pkgDefs = protoLoader.loadSync(PROTO_FILE, options);

//load Definition into gRPC
const RoomProto = grpc.loadPackageDefinition(pkgDefs);
const StorageService = grpc.loadPackageDefinition(pkgDefs).StorageService;

const gRPCServer = new grpc.Server();
const gRPCClient = new StorageService("localhost:5001", grpc.credentials.createInsecure());

const dbUrl = "mongodb://jhkim:asdf1346@localhost:27017";

mongoose
    .connect(dbUrl, {dbName: "test"})
    .then((e) => {
        console.log("connect!");
    })
    .catch((e) => {
        console.log("error!");
    });

const RoomSchema = new mongoose.Schema({
    id: Number,
    sessions: [String],
    text: String,
    storages: [String],
    expireAt: {type: Date, expires: 100},
    expireTime: Date,
});

const Room = mongoose.model("Room", RoomSchema);

gRPCServer.addService(RoomProto.RoomService.service, {
    CreateRoom: async (CreateRoomRequest, responseCallBack) => {
        try {
            const roomId = parseInt(Math.random() * 10000);

            const CreateTextRequest = {
                expireTime: CreateRoomRequest.request.expireTime,
            };

            gRPCClient.CreateText(CreateTextRequest, async (error, CreateTextResponse) => {
                const textId = CreateTextResponse.textId;

                const room = new Room({
                    id: roomId,
                    sessions: [CreateRoomRequest.request.clientSession],
                    storages: [],
                    text: textId,
                    expireAt: new Date(CreateRoomRequest.request.expireTime),
                    expireTime: new Date(CreateRoomRequest.request.expireTime),
                });

                await room.save().then((d) => {
                    console.log("저장 완료!");
                });
                const CreateRoomResponse = {
                    roomId: roomId,
                    textId: textId,
                    fileId: [],
                };
                responseCallBack(null, CreateRoomResponse);
            });
        } catch (error) {
            responseCallBack(error, null);
        }
    },
});

//start the Server
gRPCServer.bindAsync("127.0.0.1:5000", grpc.ServerCredentials.createInsecure(), (error, port) => {
    console.log(`listening on port ${port}`);
    gRPCServer.start();
});
