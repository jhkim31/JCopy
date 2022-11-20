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
        logger.info("mongodb connected");
    })
    .catch((e) => {
        logger.error(`mongodb disconnect ${e}`);
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
        logger.info(`gRPC Recv CreateRoomRequest : ${JSON.stringify(CreateRoomRequest.request)}`);
        try {
            const roomId = parseInt(Math.random() * 10000)
                .toString()
                .padStart(4, "0");

            const CreateTextRequest = {
                id: uuidv4(),
                expireTime: CreateRoomRequest.request.expireTime,
            };

            logger.info(`gRPC Send CreateTextRequest : ${JSON.stringify(CreateTextRequest)}`);
            gRPCClient.CreateText(CreateTextRequest, async (error, CreateTextResponse) => {
                if (error) {
                    logger.error(`gRPC CreateText Error : ${error}`);
                } else {
                    logger.info(`gRPC Recv CreateTextResponse : ${JSON.stringify(CreateTextResponse)}`);
                    const textId = CreateTextResponse.textId;
                    const room = new Room({
                        roomId: roomId,
                        sessions: [CreateRoomRequest.request.clientSession],
                        textId: textId,
                        fileIds: [],
                        expireAt: new Date(CreateRoomRequest.request.expireTime),
                        expireTime: new Date(CreateRoomRequest.request.expireTime),
                    });

                    await room.save().then((result) => {
                        logger.info(`Mongo Create Room ${JSON.stringify(result)}`);
                    });

                    const CreateRoomResponse = {
                        roomId: roomId,
                        textId: textId,
                        fileIds: [],
                    };
                    logger.info(`gRPC Send CreateRoomResponse : ${JSON.stringify(CreateRoomResponse)}`);
                    responseCallBack(null, CreateRoomResponse);
                }
            });
        } catch (error) {
            logger.error(`Error Processing CreateRoom.... ${error}`);
            responseCallBack(error, null);
        }
    },
    JoinRoom: async (JoinRoomRequest, responseCallBack) => {
        logger.info(`gRPC Recv JoinRoomRequest : ${JSON.stringify(JoinRoomRequest.request)}`);
        try {
            const id = JoinRoomRequest.request.id;
            const roomId = JoinRoomRequest.request.roomId;
            const clientSession = JoinRoomRequest.request.clientSession;


            await Room.updateOne({roomId: roomId}, {$addToSet: {sessions: clientSession}}).then((res) => {
                if (res.modifiedCount == 0){
                    logger.warn(`Mongo Not Search Room : ${roomId}`);
                    responseCallBack(`Not Found Room ${roomId}`, null);
                    return;
                } else {
                    logger.info(`Mongo Update Room [${roomId}] (Add Session) ${JSON.stringify(res)}`);
                }

            });

            const room = await Room.findOne({roomId: roomId});

            const JoinRoomResponse = {
                id: id,
                result: "ok",
                roomId: roomId,
                textId: room.textId,
                fileIds: room.fileIds,
            };

            logger.info(`gRPC Send JoinRoomResponse : ${JSON.stringify(JoinRoomResponse)}`);
            responseCallBack(null, JoinRoomResponse);
        } catch (error) {
            logger.error(`Error Processing JoinRoom : ${error}`);
            responseCallBack(error, null);
        }
    },
    GetJoinedSessions: async (GetJoinedSessionsRequest, responseCallBack) => {
        logger.info(`gRPC Recv GetJoinedSessionsRequest : ${JSON.stringify(GetJoinedSessionsRequest.request)}`);
        try {
            const id = GetJoinedSessionsRequest.request.id;
            const textId = GetJoinedSessionsRequest.request.textId;
            const clientSession = GetJoinedSessionsRequest.request.clientSession;

            const room = await Room.findOne({textId: textId, sessions: clientSession});

            const GetJoinedSessionsResponse = {
                roomId: room.roomId,
                clientSessions: room.sessions,
            };
            logger.info(`gRPC Send GetJoinedSessionsResponse : ${JSON.stringify(GetJoinedSessionsResponse)}`);
            responseCallBack(null, GetJoinedSessionsResponse);
        } catch (error) {
            logger.error(`Error Processing GetJoinSessions : ${error}`);
            responseCallBack(error, null);
        }
    },
});

//start the Server
gRPCServer.bindAsync("localhost:5000", grpc.ServerCredentials.createInsecure(), (error, port) => {
    logger.info(`listening on port ${port}`);
    gRPCServer.start();
});
