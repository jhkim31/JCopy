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
const cors = require("cors");
const {Kafka, Partitioners, logLevel} = require("kafkajs");
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
aws.config.loadFromPath("./s3.json");

const s3 = new aws.S3();
const upload = multer(
    {
        storage: multerS3({
            s3: s3,
            bucket: "jcopy-storage",
            key: function (req, file, cb) {
                file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8");
                cb(null, req.query.room + "/" + file.originalname);
            },
        }),
    },
    "NONE"
);

// 버킷 비우는 스크립트

// const aws = require("aws-sdk");
// aws.config.loadFromPath("./s3.json");

// const s3 = new aws.S3();
// params = {
//     Bucket: "jcopy-storage"
// }
// s3.listObjects(params, function (err, data) {
//     if (err) throw err;
//     console.log(data.Contents);
//     for (const item of data.Contents) {
//         s3.deleteObject(
//             {
//                 Bucket: "jcopy-storage", // 사용자 버켓 이름
//                 Key: item.Key,
//             },
//             (err2, data2) => {
//                 if (err2) {
//                     throw err2;
//                 }
//                 console.log("s3 deleteObject ", data2);
//             }
//         );
//     }
// });

let config = null;
if (process.env.NODE_ENV == "develop") {
    const file = fs.readFileSync("../config.yaml", "utf8");
    config = YAML.parse(file).develop;
}
if (process.env.NODE_ENV == "production") {
    const file = fs.readFileSync("./config.yaml", "utf8");
    config = YAML.parse(file).deploy;
}

logger.info(`[1-001-01] config\n${YAML.stringify(config)}`);

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
Express.use(cors());

(async () => {
    await producer.connect();
    await consumer.connect();
    logger.info("[1-002-01] kafka connected");
})();

try {
    redisClient.connect();
    logger.info("[1-003-01] redis connected");
} catch (e) {
    logger.error(`[1-003-11] redis disconnected : \n${e}`);
}

try {
    gRPCRoomServiceClient = new RoomService(`${config.grpc.RoomService.host}:${config.grpc.RoomService.port}`, grpc.credentials.createInsecure());
    gRPCStorageServiceClient = new StorageService(`${config.grpc.StorageService.host}:${config.grpc.StorageService.port}`, grpc.credentials.createInsecure());
    logger.info("[1-004-01] grpc connected");
} catch {
    logger.error(`[1-004-11] grpc connect error : \n${e}`);
}

Express.use(
    session({
        store: new RedisStore({client: redisClient}),
        secret: uuidv4(),
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60, // 60분
        },
    })
);

Express.get("/", (req, res) => {
    if (req.headers["user-agent"].includes("ELB-HealthChecker")) {
        res.send("health check");
        req.session.destroy();
    } else {
        logger.info(`[1-401-00] ${req.method} ${req.originalUrl} ${req.socket.remoteAddress}  ${JSON.stringify(req.params)} | session-id : ${req.session.id}`);
        res.redirect("/home");
    }
});

Express.get("/home", (req, res) => {
    logger.info(`[1-402-00] ${req.method} ${req.originalUrl} ${req.socket.remoteAddress}  ${JSON.stringify(req.params)} | session-id : ${req.session.id}`);
    res.sendFile("index.html", {root: "."});
});

Express.get("/joinroom", (req, res) => {
    logger.info(`[1-403-00] ${req.method} ${req.originalUrl} ${req.socket.remoteAddress}  ${JSON.stringify(req.params)} | session-id : ${req.session.id}`);
    res.sendFile("index.html", {root: "."});
});

Express.get("/room/*", (req, res) => {
    logger.info(`[1-404-00] ${req.method} ${req.originalUrl} ${req.socket.remoteAddress}  ${JSON.stringify(req.params)} | session-id : ${req.session.id}`);
    res.sendFile("/index.html", {root: "."});
});

Express.get("/text", (req, res) => {
    logger.info(`[1-405-00] ${req.method} ${req.originalUrl} ${req.socket.remoteAddress}  ${JSON.stringify(req.params)} | session-id : ${req.session.id}`);
    const GetTextRequest = {
        id: uuidv4(),
        textId: req.params.id,
    };
    console.log(req.params);

    logger.debug(`  [1-103-00] gRPC Request GetTextRequest : ${JSON.stringify(GetTextRequest)}`);
    gRPCStorageServiceClient.GetText(GetTextRequest, (error, GetTextResponse) => {
        if (error) {
            logger.error(`  [1-103-51] gRPC GetText Error RPC_ID : ${GetTextRequest.id} | ${error}`);
            res.send("");
        } else {
            logger.debug(`  [1-103-01] gRPC Response GetTextResponse : ${JSON.stringify(GetTextResponse)}`);

            logger.info(`[1-405-21] GET /text [${req.params.id}] Response : ${GetTextResponse.textValue}`);
            res.send(GetTextResponse.textValue);
        }
    });
});

Express.get("/uploadable", (req, res) => {
    const roomId = req.query.roomId;
    const size = req.query.size;
    const GetLeftStorageRequest = {
        id: uuidv4(),
        roomId: roomId,
        size: size,
    };

    gRPCRoomServiceClient.GetLeftStorage(GetLeftStorageRequest, (error, GetLeftStorageResponse) => {
        if (error) {
        } else {
            if (GetLeftStorageResponse.leftStorage < 0) {
                res.send({
                    res: 0,
                    msg: "용량 없음",
                });
            } else {
                res.send({
                    res: 1,
                    msg: "용량 있음",
                });
            }
        }
    });
});

Express.get("*", function (req, res) {
    logger.info(`[1-499-00] ${req.method} ${req.originalUrl} ${req.socket.remoteAddress}  ${JSON.stringify(req.params)} | session-id : ${req.session.id}`);
    res.status(404).redirect("/home");
});

Express.post("/room", (req, res) => {
    logger.info(`[1-501-00] ${req.method} ${req.originalUrl} ${req.socket.remoteAddress}  ${JSON.stringify(req.params)} | session-id : ${req.session.id}`);

    const CreateRoomRequest = {
        id: uuidv4(),
        clientSession: req.session.id,
        expireTime: new Date(new Date().getTime() + 1000 * 60 * 5).getTime(),
    };

    logger.debug(`  [1-101-00] gRPC Request CreateRoomRequest : ${JSON.stringify(CreateRoomRequest)}`);
    gRPCRoomServiceClient.CreateRoom(CreateRoomRequest, (error, CreateRoomResponse) => {
        if (error) {
            logger.error(`  [1-101-51] gRPC CreateRoomRequest Error RPC_ID : ${CreateRoomRequest.id} | ${error}`);
        } else {
            logger.debug(`  [1-101-01] gRPC Response CreateRoomResponse : ${JSON.stringify(CreateRoomResponse)}`);
            const GetTextRequest = {
                id: uuidv4(),
                textId: CreateRoomResponse.textId,
            };
            logger.debug(`  [1-103-00] gRPC Send GetTextRequest : ${JSON.stringify(GetTextRequest)}`);
            gRPCStorageServiceClient.GetText(GetTextRequest, (error, GetTextResponse) => {
                if (error) {
                    logger.error(`    [1-103-51] gRPC GetText Error RPC_ID : ${GetTextRequest.id} | ${error}`);
                } else {
                    logger.debug(`    [1-103-01] gRPC Recv GetTextResponse : ${JSON.stringify(GetTextResponse)}`);
                    const wsResult = {
                        roomId: CreateRoomResponse.roomId,
                        text: {
                            id: CreateRoomResponse.textId,
                            value: GetTextResponse.textValue,
                        },
                    };
                    logger.info(`[1-501-21] POST /room [${req.socket.remoteAddress}] Response : ${JSON.stringify(wsResult)}`);
                    res.send(wsResult);
                }
            });
        }
    });
});

Express.post("/joinroom", (req, res) => {
    const session = req.session;
    logger.info(
        `[1-502-00] ip : ${req.socket.remoteAddress} | session-id : ${session.id} ${req.method} ${req.originalUrl} param : ${JSON.stringify(req.params)}`
    );

    const JoinRoomRequest = {
        id: uuidv4(),
        clientSession: req.session.id,
        roomId: req.query.roomId,
    };

    logger.debug(`[1-104-00] gRPC Send JoinRoomRequest : ${JSON.stringify(JoinRoomRequest)}`);
    gRPCRoomServiceClient.JoinRoom(JoinRoomRequest, (error, JoinRoomResponse) => {
        if (error) {
            logger.error(`  [1-104-51] gRPC JoinRoom Error RPC_ID : ${JoinRoomRequest.id} | ${error}`);
        } else {
            logger.debug(`  [1-104-01] gRPC Recv JoinRoomResponse : ${JSON.stringify(JoinRoomResponse)}`);
            if (JoinRoomResponse.result == "ok") {
                const GetFilesRequest = {
                    id: uuidv4(),
                    textId: JoinRoomResponse.textId,
                    fileIds: JoinRoomResponse.fileIds,
                };
                logger.debug(`    [1-105-00] gRPC Send GetFilesRequest : ${JSON.stringify(GetFilesRequest)}`);
                gRPCStorageServiceClient.GetFiles(GetFilesRequest, (error, GetFilesResponse) => {
                    if (error) {
                        logger.error(`    [1-105-51] gRPC GetFiles Error RPC_ID : ${GetFilesRequest.id}| ${error}`);
                    } else {
                        logger.debug(`    [1-105-01] gRPC Recv GetFilesResponse : ${JSON.stringify(GetFilesResponse)}`);
                        const wsRes = {
                            roomId: JoinRoomResponse.roomId,
                            text: {
                                id: JoinRoomResponse.textId,
                                value: GetFilesResponse.textValue,
                            },
                            files: GetFilesResponse.fileNames,
                            error: 0,
                            session: req.session.id,
                            leftStorage: JoinRoomResponse.leftStorage,
                            expireTime: JoinRoomResponse.expireTime,
                        };
                        logger.info(`[1-502-21] POST /joinroom [${req.socket.remoteAddress}] Response : ${JSON.stringify(wsRes)}`);
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
                logger.info(`[1-552-71] POST /joinroom [${req.socket.remoteAddress}] Response : ${JSON.stringify(wsRes)}`);
                res.send(wsRes);
            }
        }
    });
});

Express.put("/upload", (req, res) => {
    const upload_single = upload.single("file");
    const GetLeftStorageRequest = {
        id: uuidv4(),
        roomId: req.query.room,
        size: parseInt(req.headers["content-length"]),
    };

    gRPCRoomServiceClient.GetLeftStorage(GetLeftStorageRequest, (error, GetLeftStorageResponse) => {
        if (error) {
            console.log(error);
        } else {
            if (GetLeftStorageResponse.leftStorage < 0) {
                const response = {
                    error: 1,
                    msg: "용량초과",
                    file: req.query.name,
                };
                res.send(JSON.stringify(response));
            } else {
                upload_single(req, res, (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(req.query);
                        const kafkaMsg = {
                            id: uuidv4(),
                            roomId: req.query.room,
                            size: parseInt(req.headers["content-length"]),
                            name: req.query.name,
                        };
                        const kafkaData = {topic: "UploadFile", messages: [{value: JSON.stringify(kafkaMsg)}]};
                        console.log(kafkaData);
                        producer.send(kafkaData).then((d) => {
                            if (d) {
                                logger.debug(`  [1-201-01] Produce ChangeText OK ${JSON.stringify(d)}`);
                            } else {
                                logger.debug(`  [1-201-51] Produce ChangeText error ${d}`);
                            }
                        });
                        const response = {
                            error: 0,
                            msg: "업로드 되었습니다.",
                            file: req.query.name,
                        };
                        res.send(JSON.stringify(response));
                    }
                });
            }
        }
    });
});

Express.delete("/file", (req, res) => {
    const roomId = req.query.room;
    const filename = req.query.name;
    console.log(req.query);
    const key = `${roomId}/${filename}`;
    console.log(key);
    console.log("kafka1");
    s3.deleteObject(
        {
            Bucket: "jcopy-storage", // 사용자 버켓 이름
            Key: key,
        },
        (err, data) => {
            if (err) {
                console.log(err);
            }
            console.log("s3 deleteObject ", data);
        }
    );
    console.log("kafka");
    const kafkaMsg = {
        id: uuidv4(),
        roomId: roomId,
        name: filename,
    };
    const kafkaData = {topic: "DeleteFile", messages: [{value: JSON.stringify(kafkaMsg)}]};
    console.log(kafkaData);
    producer.send(kafkaData);
    res.send("OK");
});

const HTTPServer = Express.listen(3000);

const WSServer = new wsModule.Server({
    server: HTTPServer,
});

WSServer.on("connection", async (ws, request) => {
    for (const header of request.headers.cookie.split(";")) {
        if (header.includes("connect.sid")) {
            const session = header.replace("connect.sid=s%3A", "").split(".")[0].trim();
            ws.id = session;
            logger.info(`[1-601-00] WebSocket [${session}] connected!!`);
            break;
        }
    }

    ws.on("message", async (msg) => {
        logger.debug(`[1-602-00] WS [${ws.id}] Recv msg : ${msg}`);
        const wsMsg = JSON.parse(msg);
        switch (wsMsg.type) {
            case "heartbeat":
                /*
                TODO:
                heartbeat때 할 일
                */
                break;
            case "text":
                const kafkaMsg = {
                    id: uuidv4(),
                    roomId: wsMsg.roomId,
                    textId: wsMsg.textId,
                    textValue: wsMsg.textValue,
                    clientSession: ws.id,
                };
                const kafkaData = {topic: "ChangeText", messages: [{value: JSON.stringify(kafkaMsg)}]};
                logger.debug(`  [1-201-00] Produce ChangeText ${JSON.stringify(kafkaMsg)}`);
                producer.send(kafkaData).then((d) => {
                    if (d) {
                        logger.debug(`  [1-201-01] Produce ChangeText OK ${JSON.stringify(d)}`);
                    } else {
                        logger.debug(`  [1-201-51] Produce ChangeText error ${d}`);
                    }
                });
                break;
            case "file":
                /*
                TODO:
                file때 할 일
                */
                break;
        }
    });

    ws.on("close", (code, reason) => {
        console.log(`close ws : ${ws.id}`);
        console.log(code);
    });
});

async function kafkaConsumerListener() {
    consumer.subscribe({topics: ["TextChanged", "UpdateFiles"]}).then((d) => console.log("subscribe : ", d));

    logger.info('[1-301-00] Kafka Subscribe Topics "TextChanged"');
    await consumer.run({
        eachMessage: async ({topic, partition, message, heartbeat, pause}) => {
            logger.debug(`[1-302-00] Consume ${topic} ${message.value}`);
            let msg = {};
            try {
                msg = JSON.parse(message.value.toString());
                logger.debug(`[1-302-01] Parse msg ${msg}`);
            } catch (e) {
                logger.error(`[1-302-51] Error Parsing Kafka Message ... ${e} | msg : ${message.value.toString()}`);
            }

            if (msg != {}) {
                let GetJoinedSessionsRequest = {};
                switch (topic) {
                    case "TextChanged":
                        GetJoinedSessionsRequest = {
                            id: uuidv4(),
                            roomId: msg.roomId,
                            clientSession: msg.clientSession,
                        };
                        logger.debug(`  [1-106-00] gRPC Send GetJoinedSessionsRequest : ${JSON.stringify(GetJoinedSessionsRequest)}`);
                        gRPCRoomServiceClient.GetJoinedSessions(GetJoinedSessionsRequest, (error, GetJoinedSessionsResponse) => {
                            if (error) {
                                logger.error(`  [1-106-51] gRPC GetJoinedSessions Error RPC_ID : ${GetJoinedSessionsRequest.id} | ${error}`);
                            } else {
                                logger.debug(`  [1-106-01] gRPC Recv GetJoinedSessionsResponse : ${JSON.stringify(GetJoinedSessionsResponse)}`);
                                for (const sessionId of GetJoinedSessionsResponse.clientSessions) {
                                    if (msg.clientSession != sessionId) {
                                        WSServer.clients.forEach(function each(client) {
                                            if (client.readyState == wsModule.OPEN && client.id == sessionId) {
                                                logger.debug(`    [1-603-00] WS [${client.id}] Send  msg : ${msg.textValue}`);
                                                const wsMsg = {
                                                    type: "text",
                                                    msg: msg.textValue,
                                                };
                                                client.send(JSON.stringify(wsMsg));
                                            }
                                        });
                                    }
                                }
                            }
                        });
                        break;
                    case "UpdateFiles":
                        GetJoinedSessionsRequest = {
                            id: uuidv4(),
                            roomId: msg.roomId,
                            clientSession: msg.clientSession,
                        };
                        logger.debug(`UpdateFiles  [1-106-00] gRPC Send GetJoinedSessionsRequest : ${JSON.stringify(GetJoinedSessionsRequest)}`);
                        gRPCRoomServiceClient.GetJoinedSessions(GetJoinedSessionsRequest, (error, GetJoinedSessionsResponse) => {
                            if (error) {
                                logger.error(`UpdateFiles  [1-106-51] gRPC GetJoinedSessions Error RPC_ID : ${GetJoinedSessionsRequest.id} | ${error}`);
                            } else {
                                logger.debug(`UpdateFiles  [1-106-01] gRPC Recv GetJoinedSessionsResponse : ${JSON.stringify(GetJoinedSessionsResponse)}`);
                                for (const sessionId of GetJoinedSessionsResponse.clientSessions) {
                                    logger.debug(`UpdateFiles ${sessionId}`);

                                    WSServer.clients.forEach(function each(client) {
                                        if (client.readyState == wsModule.OPEN && client.id == sessionId) {
                                            const wsMsg = {
                                                type: "file",
                                                fileIds: msg.fileIds,
                                                leftStorage: GetJoinedSessionsResponse.leftStorage,
                                            };
                                            logger.debug(`UpdateFiles send : ${sessionId}`);
                                            client.send(JSON.stringify(wsMsg));
                                        }
                                    });
                                }
                            }
                        });
                        break;
                }
            }
        },
    });
}

kafkaConsumerListener();
