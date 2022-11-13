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
    roomId: String,
    sessions: [String],
    textId: String,
    fildIds: [String],
    expireAt: {type: Date, expires: 100},
    expireTime: Date,
});

const Room = mongoose.model("Room", RoomSchema);

gRPCServer.addService(RoomProto.RoomService.service, {
    CreateRoom: async (CreateRoomRequest, responseCallBack) => {
        try {
            const roomId = parseInt(Math.random() * 10000).toString().padStart(4, '0')

            const CreateTextRequest = {
                expireTime: CreateRoomRequest.request.expireTime,
            };

            gRPCClient.CreateText(CreateTextRequest, async (error, CreateTextResponse) => {
                const textId = CreateTextResponse.textId;

                const room = new Room({
                    roomId: roomId,
                    sessions: [CreateRoomRequest.request.clientSession],
                    textId: textId,
                    fileIds: [],
                    expireAt: new Date(CreateRoomRequest.request.expireTime),
                    expireTime: new Date(CreateRoomRequest.request.expireTime),
                });

                await room.save().then((d) => {
                    console.log("저장 완료!");
                });
                const CreateRoomResponse = {
                    roomId: roomId,
                    textId: textId,
                    fileIds: [],
                };
                responseCallBack(null, CreateRoomResponse);
            });
        } catch (error) {
            responseCallBack(error, null);
        }
    },
    JoinRoom: async (JoinRoomRequest, responseCallBack) => {

        const roomId = JoinRoomRequest.request.roomId;
        const clientSession = JoinRoomRequest.request.clientSession;
        await Room.updateOne({roomId: roomId}, {$addToSet: { sessions:  clientSession}});
        const room = await Room.findOne({roomId: roomId})
        const JoinRoomResponse = {
            result: "ok",
            roomId : roomId,
            textId: room.textId,
            fileIds : room.fileIds
        }
        console.log(JoinRoomResponse)
        responseCallBack(null, JoinRoomResponse)
    }
});

//start the Server
gRPCServer.bindAsync("127.0.0.1:5000", grpc.ServerCredentials.createInsecure(), (error, port) => {
    console.log(`listening on port ${port}`);
    gRPCServer.start();
});
