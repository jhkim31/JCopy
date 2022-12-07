const logger = require("./logger");
const YAML = require("yaml");
const fs = require("fs");
const mongoose = require("mongoose");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const {v4: uuidv4} = require("uuid");
const {Kafka, Partitioners, logLevel} = require("kafkajs");

let config = {};
if (process.env.NODE_ENV == "develop") {
    const file = fs.readFileSync("../config.yaml", "utf8");
    config = YAML.parse(file).develop;
}
if (process.env.NODE_ENV == "production") {
    const file = fs.readFileSync("./config.yaml", "utf8");
    config = YAML.parse(file).deploy;
}
logger.info(`[2-001-00] config  \n${YAML.stringify(config)}`);

const PROTO_FILE = config.grpc.proto.path;

const options = {
    keepCase: true,
    longs: Number,
    defaults: true,
    oneofs: true,
};
const kafka = new Kafka({
    brokers: config.kafka.brokers,
    logLevel: logLevel.ERROR,
});

const producer = kafka.producer({createPartitioner: Partitioners.LegacyPartitioner});
const consumer = kafka.consumer({groupId: config.kafka.groupid.room});

const pkgDefs = protoLoader.loadSync(PROTO_FILE, options);
const RoomProto = grpc.loadPackageDefinition(pkgDefs);
const StorageService = grpc.loadPackageDefinition(pkgDefs).StorageService;

const gRPCServer = new grpc.Server();
const gRPCClient = new StorageService(`${config.grpc.StorageService.host}:${config.grpc.StorageService.port}`, grpc.credentials.createInsecure());

const dbUrl = `mongodb://${config.mongodb.user}:${config.mongodb.pwd}@${config.mongodb.host}:${config.mongodb.port}`;
(async () => {
    await producer.connect();
    await consumer.connect();
    logger.info("[1-002-01] kafka connected");
})();

mongoose
    .connect(dbUrl, {dbName: config.mongodb.dbName})
    .then((e) => {
        logger.info("[2-002-01] mongodb connected");
    })
    .catch((e) => {
        logger.error(`[2-002-11] mongodb disconnect ${e}`);
    });

const RoomSchema = new mongoose.Schema({
    roomId: String,
    sessions: [String],
    textId: String,
    leftStorage: Number,
    fileIds: [String],
    expireAt: {type: Date, expires: 100},
    expireTime: Date,
});

const Room = mongoose.model("Room", RoomSchema);

gRPCServer.addService(RoomProto.RoomService.service, {
    CreateRoom: async (CreateRoomRequest, responseCallBack) => {
        logger.debug(`[2-101-00] gRPC Recv CreateRoomRequest : ${JSON.stringify(CreateRoomRequest.request)}`);
        const roomId = parseInt(Math.random() * 10000)
            .toString()
            .padStart(4, "0");

        const CreateTextRequest = {
            id: uuidv4(),
            expireTime: CreateRoomRequest.request.expireTime,
        };

        logger.debug(`  [2-102-00] gRPC Request CreateTextRequest : ${JSON.stringify(CreateTextRequest)}`);
        gRPCClient.CreateText(CreateTextRequest, CreateTextCB);

        async function CreateTextCB(error, CreateTextResponse) {
            if (error) {
                logger.error(`  [2-102-51] gRPC CreateText Error RPC_ID : ${CreateTextRequest.id}: ${error}`);
                responseCallBack(error, null);
            } else {
                logger.debug(`  [2-102-01] gRPC Response CreateTextResponse : ${JSON.stringify(CreateTextResponse)}`);
                const textId = CreateTextResponse.textId;

                try {
                    const roomData = {
                        roomId: roomId,
                        sessions: [CreateRoomRequest.request.clientSession],
                        textId: textId,
                        leftStorage: 10_000_000,
                        fileIds: [],
                        expireAt: new Date(CreateRoomRequest.request.expireTime),
                        expireTime: new Date(CreateRoomRequest.request.expireTime),
                    };

                    const room = new Room(roomData);
                    logger.debug(`    [2-701-00] Mongo Create Room [${roomId}] room : ${JSON.stringify(roomData)}`);
                    await room.save().then((result) => {
                        if (result.roomId == roomId) {
                            logger.info(`    [2-701-01] Mongo Create Room[${roomId}]`);
                        } else {
                            logger.error(`    [2-701-51] Mongo Create Room Error [${roomId}]`);
                        }
                    });

                    const CreateRoomResponse = {
                        id: CreateRoomRequest.id,
                        roomId: roomId,
                        textId: textId,
                        fileIds: [],
                    };
                    logger.debug(`[2-101-21] gRPC Send CreateRoomResponse : ${JSON.stringify(CreateRoomResponse)}`);
                    responseCallBack(null, CreateRoomResponse);
                } catch (error) {
                    logger.error(`[2-101-71] gRPC Error CreateRoomResponse : ${error}`);
                    responseCallBack(error, null);
                }
            }
        }
    },
    JoinRoom: async (JoinRoomRequest, responseCallBack) => {
        logger.debug(`[2-104-00] gRPC Recv JoinRoomRequest : ${JSON.stringify(JoinRoomRequest.request)}`);
        try {
            const id = JoinRoomRequest.request.id;
            const roomId = JoinRoomRequest.request.roomId;
            const clientSession = JoinRoomRequest.request.clientSession;

            logger.debug(`  [2-702-00] Mongo Update Room ${roomId}`);
            await Room.updateOne({roomId: roomId}, {$addToSet: {sessions: clientSession}}).then((res) => {
                if (res.modifiedCount == 0) {
                    logger.warn(`  [2-702-51] RPC_ID : ${id} | Mongo Not Search Room : ${roomId}`);
                } else {
                    logger.debug(`[2-702-01] RPC_ID : ${id} | Mongo Update Room [${roomId}] (Add Session) ${JSON.stringify(res)}`);
                }
            });

            const room = await Room.findOne({roomId: roomId});
            let JoinRoomResponse = {};

            if (room) {
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
                    textId: "",
                    fileIds: "",
                };
            }

            logger.debug(`[2-104-21] gRPC Send JoinRoomResponse : ${JSON.stringify(JoinRoomResponse)}`);
            responseCallBack(null, JoinRoomResponse);
        } catch (error) {
            logger.error(`[2-104-71] Error Processing JoinRoom RPC_ID : ${JoinRoomRequest.request.id} | ${error}`);
            responseCallBack(error, null);
        }
    },
    GetJoinedSessions: async (GetJoinedSessionsRequest, responseCallBack) => {
        logger.debug(`[2-106-00] gRPC Recv GetJoinedSessionsRequest : ${JSON.stringify(GetJoinedSessionsRequest.request)}`);
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
            logger.debug(`[2-106-21] gRPC Send GetJoinedSessionsResponse : ${JSON.stringify(GetJoinedSessionsResponse)}`);
            responseCallBack(null, GetJoinedSessionsResponse);
        } catch (error) {
            logger.error(`[2-106-71] Error Processing GetJoinSessions RPC_ID : ${GetJoinedSessionsRequest.request.id} | ${error}`);
            responseCallBack(error, null);
        }
    },
});

async function kafkaConsumerListener() {
    consumer.subscribe({topics: ["UploadFile", "DeleteFile"]}).then((d) => console.log("subscribe : ", d));

    await consumer.run({
        eachMessage: async ({topic, partition, message, heartbeat, pause}) => {
            let msg = {};
            try {
                msg = JSON.parse(message.value.toString());
            } catch (e) {}
            console.log(msg);

            if (msg != {}) {
                let roomId = ""
                let room = null;
                switch (topic) {
                    case "UploadFile":
                        roomId = msg.roomId;
                        room = await Room.findOne({roomId: roomId});
                        if (room == null){
                            return;
                        }
                        console.log(roomId, room);
                        const leftStorage = room.leftStorage;
                        console.log(room);

                        await Room.updateOne(
                            {roomId: roomId},
                            {
                                $push: {fileIds: msg.name},
                                $set: {leftStorage: leftStorage - msg.size},
                            }
                        );
                        room = await Room.findOne({roomId: roomId});

                        const kafkaMsg = {
                            id: uuidv4(),
                            roomId: roomId,
                            clientSession: room.sessions,
                            fileIds: room.fileIds,
                        };
                        const kafkaData = {topic: "UpdateFiles", messages: [{value: JSON.stringify(kafkaMsg)}]};
                        logger.debug(`  [1-201-00] Produce ChangeText ${JSON.stringify(kafkaMsg)}`);
                        producer.send(kafkaData);
                        break;

                    case "DeleteFile":
                        roomId = msg.roomId;
                        const filename = msg.name;

                        await Room.updateOne({roomId: roomId}, {$pull : {fileIds: filename}})
                        room = await Room.findOne({roomId: roomId});
                        if (room == null){
                            return;
                        }
                        console.log('roomId : ', roomId, 'room : ', room);
                        const kafkaMsg2 = {
                            id: uuidv4(),
                            roomId: roomId,
                            clientSession: room.sessions,
                            fileIds: room.fileIds,
                        };
                        const kafkaData2 = {topic: "UpdateFiles", messages: [{value: JSON.stringify(kafkaMsg2)}]};
                        logger.debug(`  [1-201-00] Produce ChangeText ${JSON.stringify(kafkaMsg2)}`);
                        producer.send(kafkaData2);
                }

            }
        },
    });
}

//start the Server
gRPCServer.bindAsync("0.0.0.0:5000", grpc.ServerCredentials.createInsecure(), (error, port) => {
    logger.info(`[2] listening on port ${port}`);
    gRPCServer.start();
});
kafkaConsumerListener();
