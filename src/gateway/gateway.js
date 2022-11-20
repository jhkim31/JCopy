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

logger.info(`config  \n${YAML.stringify(config)}`);

const kafka = new Kafka({
    brokers: config.kafka.brokers,
    logLevel: logLevel.ERROR,
});
const PROTO_FILE = config.grpc.proto.path;

const options = {
    keepCase: true,
    longs: String,
    enums: String,
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

(async () => {
    await producer.connect();
    await consumer.connect();
    logger.info("kafka connected");
})();

try {
    redisClient.connect();
    logger.info("redis connected");
} catch (e) {
    logger.error(`redis disconnected : \n${e}`);
}

try {
    gRPCRoomServiceClient = new RoomService(
        `${config.grpc.RoomService.host}:${config.grpc.RoomService.port}`,
        grpc.credentials.createInsecure()
    );
    gRPCStorageServiceClient = new StorageService(
        `${config.grpc.StorageService.host}:${config.grpc.StorageService.port}`,
        grpc.credentials.createInsecure()
    );
    logger.info("grpc connected");
} catch {
    logger.error(`grpc connect error : \n${e}`);
}

const Express = express();
Express.use(express.static("./build"));

Express.use(
    session({
        store: new RedisStore({client: redisClient}),
        secret: uuidv4(),
        resave: false,
        saveUninitialized: true,
        cookie: {
            expires: 600000, // 10분 만료
        },
    })
);

Express.get("/home", (req, res) => {
    const session = req.session;
    logger.info(`ip : ${req.ip} | session-id : ${session.id} ${req.method} ${req.originalUrl} param : ${JSON.stringify(req.params)}`);

    if (session?.wsID == undefined) {
        session.wsID = session.id;
    }
    res.sendFile("index.html", {root: "."});
});

Express.get("/joinroom", (req, res) => {
    const session = req.session;
    logger.info(`ip : ${req.ip} | session-id : ${session.id} ${req.method} ${req.originalUrl} param : ${JSON.stringify(req.params)}`);

    if (session?.wsID == undefined) {
        session.wsID = session.id;
    }
    res.sendFile("index.html", {root: "."});
});

Express.post("/room", (req, res) => {
    const session = req.session;
    logger.info(`ip : ${req.ip} | session-id : ${session.id} ${req.method} ${req.originalUrl} param : ${JSON.stringify(req.params)}`);

    const CreateRoomRequest = {
        id: uuidv4(),
        clientSession: req.session.id,
        expireTime: req.session.cookie._expires,
    };
    logger.info(`gRPC Send CreateRoomRequest : ${JSON.stringify(CreateRoomRequest)}`);

    gRPCRoomServiceClient.CreateRoom(CreateRoomRequest, (error, CreateRoomResponse) => {
        if (error) {
            logger.error(`gRPC CreateRoomRequest Error ${JSON.stringify(CreateRoomRequest)} ${error}`);
        } else {
            logger.info(`gRPC Recv CreateRoomResponse : ${JSON.stringify(CreateRoomResponse)}`);
            const GetTextRequest = {
                id: uuidv4(),
                textId: CreateRoomResponse.textId,
            };
            logger.info(`gRPC Send GetTextRequest : ${JSON.stringify(GetTextRequest)}`);
            gRPCStorageServiceClient.GetText(GetTextRequest, (error, GetTextResponse) => {
                if (error) {
                    logger.error(`gRPC GetText Error : ${error}`);
                } else {
                    logger.info(`gRPC Recv GetTextResponse : ${JSON.stringify(GetTextResponse)}`);
                    const wsResult = {
                        roomId: CreateRoomResponse.roomId,
                        text: {
                            id: CreateRoomResponse.textId,
                            value: GetTextResponse.textValue,
                        },
                    };
                    logger.info(`WS Send : ${session.id} ${wsResult}`);
                    res.send(wsResult);
                }
            });
        }
    });
});

Express.post("/joinroom", (req, res) => {
    const session = req.session;
    logger.info(`ip : ${req.ip} | session-id : ${session.id} ${req.method} ${req.originalUrl} param : ${JSON.stringify(req.params)}`);

    const JoinRoomRequest = {
        id: uuidv4(),
        clientSession: req.session.id,
        roomId: req.query.roomId,
    };
    logger.info(`gRPC Send JoinRoomRequest : ${JSON.stringify(JoinRoomRequest)}`);
    gRPCRoomServiceClient.JoinRoom(JoinRoomRequest, (error, JoinRoomResponse) => {
        if (error) {
            logger.error(`gRPC JoinRoom Error : ${error}`);
        } else {
            logger.info(`gRPC Recv JoinRoomResponse : ${JSON.stringify(JoinRoomResponse)}`);
            const GetFilesRequest = {
                id: uuidv4(),
                textId: JoinRoomResponse.textId,
                fileIds: JoinRoomResponse.fileIds,
            };
            logger.info(`gRPC Send GetFilesRequest : ${JSON.stringify(GetFilesRequest)}`);
            gRPCStorageServiceClient.GetFiles(GetFilesRequest, (error, GetFilesResponse) => {
                if (error) {
                    logger.error(`gRPC GetFiles Error : ${error}`);
                } else {
                    logger.info(`gRPC Recv GetFilesResponse : ${JSON.stringify(GetFilesResponse)}`);
                    const wsRes = {
                        roomId: JoinRoomResponse.roomId,
                        text: {
                            id: JoinRoomResponse.textId,
                            value: GetFilesResponse.textValue,
                        },
                        files: GetFilesResponse.fileNames,
                    };
                    logger.info(`WS send : ${JSON.stringify(wsRes)}`);
                    res.send(wsRes);
                }
            });
        }
    });
});

Express.get("/room/*", (req, res) => {
    /*
    방 있나 없나 확인해서 리턴해주는 로직 추가해야함.
    */
    const session = req.session;
    logger.info(`ip : ${req.ip} | session-id : ${session.id} ${req.method} ${req.originalUrl} param : ${JSON.stringify(req.params)}`);

    if (session?.wsID == undefined) {
        res.redirect("/joinroom");
    }

    res.sendFile("/index.html", {root: "."});
});

Express.get("*", function (req, res) {
    const session = req.session;
    if (session.id){
        logger.info(
            `ip : ${req.ip} | session-id : ${session.id} ${req.method} ${req.originalUrl} param : ${JSON.stringify(
                req.params
            )} redirect => /home`
        );
    }
    res.status(404).redirect("/home");
});

const HTTPServer = Express.listen(3000);

const WSServer = new wsModule.Server({
    server: HTTPServer,
});

const connectedWebsockets = {};
WSServer.on("connection", async (ws, request) => {
    for (const header of request.rawHeaders) {
        if (header.includes("connect.sid")) {
            const session = header.replace("connect.sid=s%3A", "").split(".")[0];
            ws.id = JSON.parse(await redisClient.v4.get(`sess:${session}`)).wsID;
            connectedWebsockets[ws.id] = ws;
        }
    }
    logger.info(`WebSocket [${ws.id}] connected!!`);
    logger.info(`Total Ws : ${Object.keys(connectedWebsockets)}`);

    ws.on("message", async (msg) => {
        logger.info(`WS Recv ${ws.id} msg : ${msg}`);
        const wsMsg = JSON.parse(msg);

        const kafkaMsg = {
            id: uuidv4(),
            textId: wsMsg.textId,
            textValue: wsMsg.textValue,
            clientSession: ws.id,
        };

        const kafkaData = {topic: "ChangeText", messages: [{value: JSON.stringify(kafkaMsg)}]};
        logger.info(`Produce Message : [ChangeText] ${JSON.stringify(kafkaMsg)}`);
        await producer.send(kafkaData);
    });
});

async function kafkaConsumerListener() {
    await consumer.subscribe({topics: ["TextChanged"]});
    logger.info('Kafka Subscribe Topics "TextChanged"');
    await consumer.run({
        eachMessage: async ({topic, partition, message, heartbeat, pause}) => {
            logger.info(`Consume Message :[${topic}] ${message.value}`);
            let msg = {};
            try{
                msg = JSON.parse(message.value.toString());
            } catch (e){
                logger.error(`Error Parsing Kafka Message ... ${e} | msg : ${message.value.toString()}`);
            }

            if (msg != {}) {
                if (topic == "TextChanged") {
                    const GetJoinedSessionsRequest = {
                        id: uuidv4(),
                        textId: msg.textId,
                        clientSession: msg.clientSession,
                    };
                    logger.info(`gRPC Send GetJoinedSessionsRequest : ${JSON.stringify(GetJoinedSessionsRequest)}`);
                    gRPCRoomServiceClient.GetJoinedSessions(GetJoinedSessionsRequest, (error, GetJoinedSessionsResponse) => {
                        if (error) {
                            logger.error(`gRPC GetJoinedSessions Error : ${error}`);
                        } else {
                            logger.info(`gRPC Recv GetJoinedSessionsResponse : ${JSON.stringify(GetJoinedSessionsResponse)}`);
                            for (const sessionId of GetJoinedSessionsResponse.clientSessions) {
                                if (msg.clientSession != sessionId) {
                                    const ws = connectedWebsockets[sessionId];
                                    logger.info(`WS Send : ${ws.id} ${msg.textValue}`);
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
