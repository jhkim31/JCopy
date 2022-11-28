const logger = require("./logger");
const YAML = require("yaml");
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const {createClient} = require("redis");
const wsModule = require("ws");
const {v4: uuidv4} = require("uuid");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const {Kafka, Partitioners, logLevel} = require("kafkajs");

let config = null;
if (process.env.NODE_ENV == "develop") {
    const file = fs.readFileSync("../config.yaml", "utf8");
    config = YAML.parse(file).develop;
}
if (process.env.NODE_ENV == "production") {
    const file = fs.readFileSync("./config.yaml", "utf8");
    config = YAML.parse(file).deploy;
}

logger.info(`config [0001]  \n${YAML.stringify(config)}`);

const kafka = new Kafka({
    brokers: config.kafka.brokers,
    logLevel: logLevel.ERROR,
});
const PROTO_FILE = config.grpc.proto.path;

const options = {
    keepCase: true,
    longs: Number,
    defaults: true,
    oneofs: true,
};

const pkgDefs = protoLoader.loadSync(PROTO_FILE, options);
const RoomService = grpc.loadPackageDefinition(pkgDefs).RoomService;
const StorageService = grpc.loadPackageDefinition(pkgDefs).StorageService;
let gRPCRoomServiceClient = null;
let gRPCStorageServiceClient = null;

const producer = kafka.producer({createPartitioner: Partitioners.LegacyPartitioner});
const consumer = kafka.consumer({groupId: config.kafka.groupid.gateway});
const redisClient = createClient({url: `redis://${config.redis.host}:${config.redis.port}`, legacyMode: true});
const Express = express();
Express.use(express.static("./build"));

(async () => {
    await producer.connect();
    await consumer.connect();
    logger.info("[0002] kafka connected");
})();

try {
    redisClient.connect();
    logger.info("[0003] redis connected");
} catch (e) {
    logger.error(`[0004] redis disconnected : \n${e}`);
}

try {
    gRPCRoomServiceClient = new RoomService(`${config.grpc.RoomService.host}:${config.grpc.RoomService.port}`, grpc.credentials.createInsecure());
    gRPCStorageServiceClient = new StorageService(`${config.grpc.StorageService.host}:${config.grpc.StorageService.port}`, grpc.credentials.createInsecure());
    logger.info("[0005] grpc connected");
} catch {
    logger.error(`[0006] grpc connect error : \n${e}`);
}

Express.use(
    session({
        store: new RedisStore({client: redisClient}),
        secret: uuidv4(),
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 10, // 10분
        },
    })
);

Express.get("/", (req, res) => {
    if (req.headers["user-agent"].includes("ELB-HealthChecker")) {
        res.send("health check");
        req.session.destroy();
    } else {
        logger.info(`[0007] ${req.method} ${req.originalUrl} ${req.socket.remoteAddress}  ${JSON.stringify(req.params)} | session-id : ${req.session.id}`);
        res.redirect("/home");
    }
});

Express.get("/home", (req, res) => {
    logger.info(`[0008] ${req.method} ${req.originalUrl} ${req.socket.remoteAddress}  ${JSON.stringify(req.params)} | session-id : ${req.session.id}`);
    res.sendFile("index.html", {root: "."});
});

Express.get("/joinroom", (req, res) => {
    logger.info(`[0009] ${req.method} ${req.originalUrl} ${req.socket.remoteAddress}  ${JSON.stringify(req.params)} | session-id : ${req.session.id}`);
    res.sendFile("index.html", {root: "."});
});

Express.get("/room/*", (req, res) => {
    logger.info(`[0010] ${req.method} ${req.originalUrl} ${req.socket.remoteAddress}  ${JSON.stringify(req.params)} | session-id : ${req.session.id}`);
    /*
    방 있나 없나 확인해서 리턴해주는 로직 추가해야함.
    */

    res.sendFile("/index.html", {root: "."});
});

Express.get("/text", (req, res) => {

    const GetTextRequest = {
        id: uuidv4(),
        textId: req.params.id,
    };
    console.log(req.params)

    logger.debug(`[0011] gRPC Send GetTextRequest : ${JSON.stringify(GetTextRequest)}`);
    gRPCStorageServiceClient.GetText(GetTextRequest, (error, GetTextResponse) => {
        if (error) {
            logger.error(`[0012] gRPC GetText Error RPC_ID : ${GetTextRequest.id} | ${error}`);
            res.send("");
        } else {
            logger.debug(`[0013] gRPC Recv GetTextResponse : ${JSON.stringify(GetTextResponse)}`);
            logger.info(`[0014] GET /text [${req.params.id}] Response : ${GetTextResponse.textValue}`);
            res.send(GetTextResponse.textValue);
        }
    });
});

Express.get("*", function (req, res) {
    logger.info(`[0015] ip : ${req.socket.remoteAddress} | ${req.method} ${req.originalUrl} param : ${JSON.stringify(req.params)} redirect => /home`);
    res.status(404).redirect("/home");
});

Express.post("/room", (req, res) => {
    const session = req.session;
    logger.info(`[0016] ip : ${req.socket.remoteAddress} | ${req.method} ${req.originalUrl} param : ${JSON.stringify(req.params)} | session-id : ${session.id}`);

    const CreateRoomRequest = {
        id: uuidv4(),
        clientSession: req.session.id,
        expireTime: new Date(new Date().getTime() + 1000 * 60 * 5).getTime()
    };

    logger.debug(`[0017] gRPC Send CreateRoomRequest : ${JSON.stringify(CreateRoomRequest)}`);
    gRPCRoomServiceClient.CreateRoom(CreateRoomRequest, (error, CreateRoomResponse) => {
        if (error) {
            logger.error(`[0018] gRPC CreateRoomRequest Error RPC_ID : ${CreateRoomRequest.id} | ${error}`);
        } else {
            logger.debug(`[0019] gRPC Recv CreateRoomResponse : ${JSON.stringify(CreateRoomResponse)}`);
            const GetTextRequest = {
                id: uuidv4(),
                textId: CreateRoomResponse.textId,
            };
            logger.debug(`[0020] gRPC Send GetTextRequest : ${JSON.stringify(GetTextRequest)}`);
            gRPCStorageServiceClient.GetText(GetTextRequest, (error, GetTextResponse) => {
                if (error) {
                    logger.error(`[0021] gRPC GetText Error RPC_ID : ${GetTextRequest.id} | ${error}`);
                } else {
                    logger.debug(`[0022] gRPC Recv GetTextResponse : ${JSON.stringify(GetTextResponse)}`);
                    const wsResult = {
                        roomId: CreateRoomResponse.roomId,
                        text: {
                            id: CreateRoomResponse.textId,
                            value: GetTextResponse.textValue,
                        },
                    };
                    logger.info(`[0023] POST /room [${req.socket.remoteAddress}] Response : ${JSON.stringify(wsResult)}`);
                    res.send(wsResult);
                }
            });
        }
    });
});

Express.post("/joinroom", (req, res) => {
    const session = req.session;
    logger.info(`[0024] ip : ${req.socket.remoteAddress} | session-id : ${session.id} ${req.method} ${req.originalUrl} param : ${JSON.stringify(req.params)}`);

    const JoinRoomRequest = {
        id: uuidv4(),
        clientSession: req.session.id,
        roomId: req.query.roomId,
    };

    logger.debug(`[0025] gRPC Send JoinRoomRequest : ${JSON.stringify(JoinRoomRequest)}`);
    gRPCRoomServiceClient.JoinRoom(JoinRoomRequest, (error, JoinRoomResponse) => {
        if (error) {
            logger.error(`[0026] gRPC JoinRoom Error RPC_ID : ${JoinRoomRequest.id} | ${error}`);
        } else {
            logger.debug(`[0027] gRPC Recv JoinRoomResponse : ${JSON.stringify(JoinRoomResponse)}`);
            if (JoinRoomResponse.result == "ok") {
                const GetFilesRequest = {
                    id: uuidv4(),
                    textId: JoinRoomResponse.textId,
                    fileIds: JoinRoomResponse.fileIds,
                };
                logger.debug(`[0028] gRPC Send GetFilesRequest : ${JSON.stringify(GetFilesRequest)}`);
                gRPCStorageServiceClient.GetFiles(GetFilesRequest, (error, GetFilesResponse) => {
                    if (error) {
                        logger.error(`[0029] gRPC GetFiles Error RPC_ID : ${GetFilesRequest.id}| ${error}`);
                    } else {
                        logger.debug(`[0030] gRPC Recv GetFilesResponse : ${JSON.stringify(GetFilesResponse)}`);
                        const wsRes = {
                            roomId: JoinRoomResponse.roomId,
                            text: {
                                id: JoinRoomResponse.textId,
                                value: GetFilesResponse.textValue,
                            },
                            files: GetFilesResponse.fileNames,
                            error: 0,
                        };
                        logger.info(`[0031] POST /joinroom [${req.socket.remoteAddress}] Response : ${JSON.stringify(wsRes)}`);
                        res.send(wsRes);
                    }
                });
            } else {
                const wsRes = {
                    roomId: JoinRoomResponse.roomId,
                    text: {},
                    files: [],
                    error: 1,
                };
                logger.info(`[0032] POST /joinroom [${req.socket.remoteAddress}] Response : ${JSON.stringify(wsRes)}`);
                res.send(wsRes);
            }
        }
    });
});

const HTTPServer = Express.listen(3000);

const WSServer = new wsModule.Server({
    server: HTTPServer,
});

const connectedWebsockets = {};

WSServer.on("connection", async (ws, request) => {
    for (const header of request.headers.cookie.split(";")) {
        if (header.includes("connect.sid")) {
            const session = header.replace("connect.sid=s%3A", "").split(".")[0];
            connectedWebsockets[session] = ws;
            ws.id = session;
            logger.info(`[0033] WebSocket [${session}] connected!!`);
            break;
        }
    }

    logger.info(`[0034] Total Ws : ${Object.keys(connectedWebsockets)}`);

    ws.on("message", async (msg) => {
        logger.debug(`[0035] WS [${ws.id}] Recv msg : ${msg}`);
        const wsMsg = JSON.parse(msg);

        const kafkaMsg = {
            id: uuidv4(),
            roomId: wsMsg.roomId,
            textId: wsMsg.textId,
            textValue: wsMsg.textValue,
            clientSession: ws.id,
        };

        const kafkaData = {topic: "ChangeText", messages: [{value: JSON.stringify(kafkaMsg)}]};
        logger.debug(`[0036] Produce ChangeText ${JSON.stringify(kafkaMsg)}`);
        await producer.send(kafkaData);
    });
});

async function kafkaConsumerListener() {
    await consumer.subscribe({topics: ["TextChanged"]});
    logger.info('[0037] Kafka Subscribe Topics "TextChanged"');
    await consumer.run({
        eachMessage: async ({topic, partition, message, heartbeat, pause}) => {
            logger.debug(`[0038] Consume ${topic} ${message.value}`);
            let msg = {};
            try {
                msg = JSON.parse(message.value.toString());
            } catch (e) {
                logger.error(`[0039] Error Parsing Kafka Message ... ${e} | msg : ${message.value.toString()}`);
            }

            if (msg != {}) {
                if (topic == "TextChanged") {
                    const GetJoinedSessionsRequest = {
                        id: uuidv4(),
                        roomId: msg.roomId,
                        clientSession: msg.clientSession,
                    };
                    logger.debug(`[0040] gRPC Send GetJoinedSessionsRequest : ${JSON.stringify(GetJoinedSessionsRequest)}`);
                    gRPCRoomServiceClient.GetJoinedSessions(GetJoinedSessionsRequest, (error, GetJoinedSessionsResponse) => {
                        if (error) {
                            logger.error(`[0041] gRPC GetJoinedSessions Error RPC_ID : ${GetJoinedSessionsRequest.id} | ${error}`);
                        } else {
                            logger.debug(`[0042] gRPC Recv GetJoinedSessionsResponse : ${JSON.stringify(GetJoinedSessionsResponse)}`);
                            for (const sessionId of GetJoinedSessionsResponse.clientSessions) {
                                if (msg.clientSession != sessionId) {
                                    const ws = connectedWebsockets[sessionId];
                                    logger.debug(`WS [${ws.id}] Send  msg : ${msg.textValue}`);
                                    ws.send(msg.textValue);
                                }
                            }
                        }
                    });
                }
            }
        },
    });
}

kafkaConsumerListener();
