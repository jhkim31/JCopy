const logger = require("./logger");
const YAML = require("yaml");
const fs = require("fs");
const mongoose = require("mongoose");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const {v4: uuidv4} = require("uuid");

let config = {};
if (process.env.NODE_ENV == "develop") {
    const file = fs.readFileSync("../config.yaml", "utf8");
    config = YAML.parse(file).develop;
}
if (process.env.NODE_ENV == "production") {
    const file = fs.readFileSync("./config.yaml", "utf8");
    config = YAML.parse(file).deploy;
}
logger.info(`[0001] config  \n${YAML.stringify(config)}`);

const PROTO_FILE = config.grpc.proto.path;

const options = {
    keepCase: true,
    longs: Number,
    defaults: true,
    oneofs: true,
};

const pkgDefs = protoLoader.loadSync(PROTO_FILE, options);
const RoomProto = grpc.loadPackageDefinition(pkgDefs);
const StorageService = grpc.loadPackageDefinition(pkgDefs).StorageService;

const gRPCServer = new grpc.Server();
const gRPCClient = new StorageService(
    `${config.grpc.StorageService.host}:${config.grpc.StorageService.port}`,
    grpc.credentials.createInsecure()
);

const dbUrl = `mongodb://${config.mongodb.user}:${config.mongodb.pwd}@${config.mongodb.host}:${config.mongodb.port}`;

mongoose
    .connect(dbUrl, {dbName: config.mongodb.dbName})
    .then((e) => {
        logger.info("[0002] mongodb connected");
    })
    .catch((e) => {
        logger.error(`[0003] mongodb disconnect ${e}`);
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
        logger.debug(`[0004] gRPC Recv CreateRoomRequest : ${JSON.stringify(CreateRoomRequest.request)}`);
        try {
            const roomId = parseInt(Math.random() * 10000)
                .toString()
                .padStart(4, "0");

            const CreateTextRequest = {
                id: uuidv4(),
                expireTime: CreateRoomRequest.request.expireTime,
            };

            logger.debug(`[0005] gRPC Send CreateTextRequest : ${JSON.stringify(CreateTextRequest)}`);
            gRPCClient.CreateText(CreateTextRequest, async (error, CreateTextResponse) => {
                if (error) {
                    logger.error(`[0006] gRPC CreateText Error RPC_ID : ${CreateTextRequest.id}: ${error}`);
                } else {
                    logger.debug(`[0007] gRPC Recv CreateTextResponse : ${JSON.stringify(CreateTextResponse)}`);
                    const textId = CreateTextResponse.textId;
                    const roomData = {
                        roomId: roomId,
                        sessions: [CreateRoomRequest.request.clientSession],
                        textId: textId,
                        fileIds: [],
                        expireAt: new Date(CreateRoomRequest.request.expireTime),
                        expireTime: new Date(CreateRoomRequest.request.expireTime),
                    }
                    logger.debug(`[0008] Mongo Create Room [${roomId}] room : ${JSON.stringify(roomData)}`);
                    const room = new Room(roomData);

                    await room.save().then((result) => {
                        logger.info(`[0009] Mongo Create Room[${roomId}] res : ${JSON.stringify(result)}`);
                    });

                    const CreateRoomResponse = {
                        id: CreateRoomRequest.id,
                        roomId: roomId,
                        textId: textId,
                        fileIds: [],
                    };
                    logger.debug(`[0010] gRPC Send CreateRoomResponse : ${JSON.stringify(CreateRoomResponse)}`);
                    responseCallBack(null, CreateRoomResponse);
                }
            });
        } catch (error) {
            logger.error(`[0011] Error Processing CreateRoom.... ${error}`);
            responseCallBack(error, null);
        }
    },
    JoinRoom: async (JoinRoomRequest, responseCallBack) => {
        logger.debug(`[0012] gRPC Recv JoinRoomRequest : ${JSON.stringify(JoinRoomRequest.request)}`);
        try {
            const id = JoinRoomRequest.request.id;
            const roomId = JoinRoomRequest.request.roomId;
            const clientSession = JoinRoomRequest.request.clientSession;

            await Room.updateOne({roomId: roomId}, {$addToSet: {sessions: clientSession}}).then((res) => {
                if (res.modifiedCount == 0){
                    logger.warn(`[0013] RPC_ID : ${id} | Mongo Not Search Room : ${roomId}`);
                } else {
                    logger.debug(`[0014] RPC_ID : ${id} | Mongo Update Room [${roomId}] (Add Session) ${JSON.stringify(res)}`);
                }

            });

            const room = await Room.findOne({roomId: roomId});
            let JoinRoomResponse = {};

            if (room){
                JoinRoomResponse = {
                    id: id,
                    result: "ok",
                    roomId: roomId,
                    textId: room.textId,
                    fileIds: room.fileIds,
                };
            } else {
                JoinRoomResponse = {
                    id: id,
                    result: "Not Found Room",
                    roomId: roomId,
                    textId: '',
                    fileIds: '',
                };
            }

            logger.debug(`[0015] gRPC Send JoinRoomResponse : ${JSON.stringify(JoinRoomResponse)}`);
            responseCallBack(null, JoinRoomResponse);
        } catch (error) {
            logger.error(`[0016] Error Processing JoinRoom RPC_ID : ${JoinRoomRequest.request.id} | ${error}`);
            responseCallBack(error, null);
        }
    },
    GetJoinedSessions: async (GetJoinedSessionsRequest, responseCallBack) => {
        logger.debug(`[0017] gRPC Recv GetJoinedSessionsRequest : ${JSON.stringify(GetJoinedSessionsRequest.request)}`);
        try {
            const id = GetJoinedSessionsRequest.request.id;
            const roomId = GetJoinedSessionsRequest.request.roomId;
            const clientSession = GetJoinedSessionsRequest.request.clientSession;

            const room = await Room.findOne({roomId: roomId});
            const GetJoinedSessionsResponse = {
                id: id,
                roomId: room.roomId,
                clientSessions: room.sessions,
            };
            logger.debug(`[0018] gRPC Send GetJoinedSessionsResponse : ${JSON.stringify(GetJoinedSessionsResponse)}`);
            responseCallBack(null, GetJoinedSessionsResponse);
        } catch (error) {
            logger.error(`[0019] Error Processing GetJoinSessions RPC_ID : ${GetJoinedSessionsRequest.request.id} | ${error}`);
            responseCallBack(error, null);
        }
    },
});

//start the Server
gRPCServer.bindAsync("0.0.0.0:5000", grpc.ServerCredentials.createInsecure(), (error, port) => {
    logger.info(`[0000] listening on port ${port}`);
    gRPCServer.start();
});
