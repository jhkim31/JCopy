const develop = process.argv[2];

const YAML = require("yaml");
const fs = require("fs");

const mongoose = require("mongoose");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

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

const PROTO_FILE = config.grpc.proto.path;

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
const gRPCClient = new StorageService(`${config.grpc.StorageService.host}:${config.grpc.StorageService.port}`, grpc.credentials.createInsecure());

const dbUrl = `mongodb://${config.mongodb.user}:${config.mongodb.pwd}@${config.mongodb.host}:${config.mongodb.port}`;

mongoose
    .connect(dbUrl, {dbName: config.mongodb.dbName})
    .then((e) => {
        console.log('ok')
    })
    .catch((e) => {
        console.log('mongo error')
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
        console.log(CreateRoomRequest);
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

        responseCallBack(null, JoinRoomResponse)
    },
    GetJoinedSessions: async(GetJoinedSessionsRequest, responseCallBack) => {
        try{
            const textId = GetJoinedSessionsRequest.request.textId;
            const clientSession = GetJoinedSessionsRequest.request.clientSession;

            const room = await Room.findOne({textId: textId, sessions: clientSession});

            const GetJoinedSessionsResponse = {
                roomId: room.roomId,
                clientSessions: room.sessions
            }
            responseCallBack(null, GetJoinedSessionsResponse);
        } catch(error) {

        }
    }
});

//start the Server
gRPCServer.bindAsync("0.0.0.0:5000", grpc.ServerCredentials.createInsecure(), (error, port) => {
    console.log(`listening on port ${port}`);
    gRPCServer.start();
});
