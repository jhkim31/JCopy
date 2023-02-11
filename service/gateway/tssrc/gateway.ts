import logger from "./logger";
import YAML from "yaml";
import fs from "fs";
import express, { Request, Response} from "express";
import session from "express-session";
import connect_redis from "connect-redis";
import { createClient } from "redis";
import ws from "ws";
import { v4 as uuidv4 } from "uuid";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import cors from "cors";
import { Kafka, Partitioners, logLevel } from "kafkajs";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import aws from "aws-sdk";

import {RoomServiceClient} from "./protoDef/RoomService";
import { StorageServiceClient } from "./protoDef/StorageService";
import { ProtoGrpcType } from "./protoDef/jcopy";
import { GetTextRequest } from "./protoDef/GetTextRequest";
import { GetTextResponse__Output } from "./protoDef/GetTextResponse";
import { GetLeftStorageRequest, GetLeftStorageRequest__Output } from "./protoDef/GetLeftStorageRequest";
import { defaultHandler } from "./handler/expressHandler";
import { GetLeftStorageResponse__Output } from "./protoDef/GetLeftStorageResponse";
import { JoinRoomRequest } from "./protoDef/JoinRoomRequest";
import { GetJoinedSessionsRequest } from "./protoDef/GetJoinedSessionsRequest";

// aws.config.loadFromPath("./s3.json");

// const s3 = new aws.S3();
const RedisStore = connect_redis(session);
const s3Config = new S3Client({
    region: "ap-northeast-2",
    credentials:{
        accessKeyId: 'AKIAVV42TBGWRKIQ4XFC',
        secretAccessKey:'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'
    }
})
const upload = multer(
    {
        storage: multerS3({
            s3: s3Config,
            bucket: "jcopy-storage",
            key: function (req: Request, file, cb) {
                file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8");
                cb(null, req.query.room + "/" + file.originalname);
            },
        }),
    }
);

let config = null;
if (process.env.NODE_ENV == "develop") {
    const file = fs.readFileSync("../../config.yaml", "utf8");
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

const PROTO_FILE = '../../proto/jcopy.proto';

const gRPCOptions = {
    keepCase: true,
    longs: Number,
    defaults: true,
    oneofs: true,
};

const pkgDefs = protoLoader.loadSync(PROTO_FILE, gRPCOptions);
const gRPCDef: ProtoGrpcType = grpc.loadPackageDefinition(pkgDefs) as any;
let gRPCRoomServiceClient: RoomServiceClient = new gRPCDef.RoomService(`${config.grpc.RoomService.host}:${config.grpc.RoomService.port}`, grpc.credentials.createInsecure());;
let gRPCStorageServiceClient: StorageServiceClient = new gRPCDef.StorageService(`${config.grpc.StorageService.host}:${config.grpc.StorageService.port}`, grpc.credentials.createInsecure());

const producer = kafka.producer({createPartitioner: Partitioners.LegacyPartitioner});
const consumer = kafka.consumer({groupId: config.kafka.groupid.gateway});
const redisClient = createClient({url: `redis://${config.redis.host}:${config.redis.port}`, legacyMode: true});
const Express = express();
Express.use(express.static("./build"));
Express.use(cors());

(async () => {
    await producer.connect();
    await consumer.connect();
})();

try {
    redisClient.connect();
} catch (e) {
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

Express.get("/", (req:Request, res: Response) => {
    if (req.headers["user-agent"]?.includes("ELB-HealthChecker")) {
        res.send("health check");
        req.session.destroy((err) => {
            console.log(`세션 삭제 에러 : ${err}`);
        });
    } else {
        logger.info(`[1-401-00] ${req.method} ${req.originalUrl} ${req.socket.remoteAddress}  ${JSON.stringify(req.params)} | session-id : ${req.session.id}`);
        res.redirect("/home");
    }
});

Express.get("/home", defaultHandler);
Express.get("/joinroom", defaultHandler);
Express.get("/room/*", defaultHandler);

Express.get("/text", (req: Request, res: Response) => {
    logger.info(`[1-405-00] ${req.method} ${req.originalUrl} ${req.socket.remoteAddress}  ${JSON.stringify(req.params)} | session-id : ${req.session.id}`);
    const GetTextRequest: GetTextRequest = {
        id: uuidv4(),
        textId: req.params?.id,
    };
    console.log(req.params);

    logger.debug(`  [1-103-00] gRPC Request GetTextRequest : ${JSON.stringify(GetTextRequest)}`);
    gRPCStorageServiceClient.GetText(GetTextRequest, (error: grpc.ServiceError | null, GetTextResponse: GetTextResponse__Output | undefined) => {
        if (error) {
            logger.error(`  [1-103-51] gRPC GetText Error RPC_ID : ${GetTextRequest.id} | ${error}`);
            res.send("");
        } else {
            logger.debug(`  [1-103-01] gRPC Response GetTextResponse : ${JSON.stringify(GetTextResponse)}`);
            logger.info(`[1-405-21] GET /text [${req.params?.id}] Response : ${GetTextResponse?.textValue}`);
            res.send(GetTextResponse?.textValue);
        }
    });
});

Express.get("/uploadable", (req: Request, res: Response) => {
    const roomId = req?.query?.roomId as string;
    const size = parseInt(req?.query?.size as string);
    const GetLeftStorageRequest: GetLeftStorageRequest = {
        id: uuidv4(),
        roomId: roomId,
        size: size,
    };

    gRPCRoomServiceClient.GetLeftStorage(GetLeftStorageRequest, (error: grpc.ServiceError | null, GetLeftStorageResponse: GetLeftStorageResponse__Output | undefined) => {
        if (error) {
        } else {
            if (GetLeftStorageResponse!.leftStorage < 0) {
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

Express.get("*", function (req: Request, res: Response) {
    logger.info(`[1-499-00] ${req.method} ${req.originalUrl} ${req.socket.remoteAddress}  ${JSON.stringify(req.params)} | session-id : ${req.session.id}`);
    res.status(404).redirect("/home");
});

Express.post("/room", (req: Request, res: Response) => {
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
                textId: CreateRoomResponse?.textId,
            };
            logger.debug(`  [1-103-00] gRPC Send GetTextRequest : ${JSON.stringify(GetTextRequest)}`);
            gRPCStorageServiceClient.GetText(GetTextRequest, (error, GetTextResponse) => {
                if (error) {
                    logger.error(`    [1-103-51] gRPC GetText Error RPC_ID : ${GetTextRequest.id} | ${error}`);
                } else {
                    logger.debug(`    [1-103-01] gRPC Recv GetTextResponse : ${JSON.stringify(GetTextResponse)}`);
                    const wsResult = {
                        roomId: CreateRoomResponse?.roomId,
                        text: {
                            id: CreateRoomResponse?.textId,
                            value: GetTextResponse?.textValue,
                        },
                    };
                    logger.info(`[1-501-21] POST /room [${req.socket.remoteAddress}] Response : ${JSON.stringify(wsResult)}`);
                    res.send(wsResult);
                }
            });
        }
    });
});

Express.post("/joinroom", (req: Request, res: Response) => {
    const session = req.session;
    logger.info(
        `[1-502-00] ip : ${req.socket.remoteAddress} | session-id : ${session.id} ${req.method} ${req.originalUrl} param : ${JSON.stringify(req.params)}`
    );

    const JoinRoomRequest: JoinRoomRequest = {
        id: uuidv4(),
        clientSession: req.session.id,
        roomId: req.query.roomId as string,
    };

    logger.debug(`[1-104-00] gRPC Send JoinRoomRequest : ${JSON.stringify(JoinRoomRequest)}`);
    gRPCRoomServiceClient.JoinRoom(JoinRoomRequest, (error, JoinRoomResponse) => {
        if (error) {
            logger.error(`  [1-104-51] gRPC JoinRoom Error RPC_ID : ${JoinRoomRequest.id} | ${error}`);
        } else {
            logger.debug(`  [1-104-01] gRPC Recv JoinRoomResponse : ${JSON.stringify(JoinRoomResponse)}`);
            if (JoinRoomResponse?.result == "ok") {
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
                                value: GetFilesResponse?.textValue,
                            },
                            files: GetFilesResponse?.fileNames,
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
                    roomId: JoinRoomResponse?.roomId,
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

Express.put("/upload", (req: Request, res: Response) => {
    const upload_single = upload.single("file");
    const GetLeftStorageRequest: GetLeftStorageRequest = {
        id: uuidv4(),
        roomId: req.query.room as string,
        size: parseInt(req.headers["content-length"] ?? '0'),
    };

    gRPCRoomServiceClient.GetLeftStorage(GetLeftStorageRequest, (error, GetLeftStorageResponse) => {
        if (error) {
            console.log(error);
        } else {
            if (GetLeftStorageResponse?.leftStorage ?? 0 < 0) {
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
                            size: parseInt(req.headers["content-length"] ?? '0'),
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

// Express.delete("/file", (req: Request, res: Response) => {
//     const roomId = req.query.room;
//     const filename = req.query.name;
//     console.log(req.query);
//     const key = `${roomId}/${filename}`;
//     console.log(key);
//     console.log("kafka1");
//     s3.deleteObject(
//         {
//             Bucket: "jcopy-storage", // 사용자 버켓 이름
//             Key: key,
//         },
//         (err, data) => {
//             if (err) {
//                 console.log(err);
//             }
//             console.log("s3 deleteObject ", data);
//         }
//     );
//     console.log("kafka");
//     const kafkaMsg = {
//         id: uuidv4(),
//         roomId: roomId,
//         name: filename,
//     };
//     const kafkaData = {topic: "DeleteFile", messages: [{value: JSON.stringify(kafkaMsg)}]};
//     console.log(kafkaData);
//     producer.send(kafkaData);
//     res.send("OK");
// });

const HTTPServer = Express.listen(3000);

const WSServer = new ws.Server({
    server: HTTPServer,
});
interface CustomWS extends ws.WebSocket {
    id: string
}

WSServer.on("connection", async (ws: CustomWS, request) => {
    for (const header of (request?.headers?.cookie ?? '').split(";")) {
        if (header.includes("connect.sid")) {
            const session = header.replace("connect.sid=s%3A", "").split(".")[0].trim();
            ws.id = session;
            logger.info(`[1-601-00] WebSocket [${session}] connected!!`);
            break;
        }
    }

    ws.on("message", async (msg: string) => {
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

            let msg = JSON.parse((message?.value ?? '').toString());
            // try {

            //     logger.debug(`[1-302-01] Parse msg ${msg}`);
            // } catch (e) {
            //     logger.error(`[1-302-51] Error Parsing Kafka Message ... ${e} | msg : ${(message?.value ?? '').toString()}`);
            // }

            if (msg != undefined) {
                let GetJoinedSessionsRequest: GetJoinedSessionsRequest = {
                    id: '',
                    roomId: '',
                    clientSession: ''
                };
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
                                for (const sessionId of GetJoinedSessionsResponse?.clientSessions ?? []) {
                                    if (msg.clientSession != sessionId) {
                                        WSServer.clients.forEach(function each(client: any) {
                                            if (client.readyState == ws.OPEN && client?.id == sessionId) {
                                                logger.debug(`    [1-603-00] WS [${client?.id}] Send  msg : ${msg.textValue}`);
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
                        gRPCRoomServiceClient.GetJoinedSessions(GetJoinedSessionsRequest, (error: any, GetJoinedSessionsResponse: any) => {
                            if (error) {
                                logger.error(`UpdateFiles  [1-106-51] gRPC GetJoinedSessions Error RPC_ID : ${GetJoinedSessionsRequest.id} | ${error}`);
                            } else {
                                logger.debug(`UpdateFiles  [1-106-01] gRPC Recv GetJoinedSessionsResponse : ${JSON.stringify(GetJoinedSessionsResponse)}`);
                                for (const sessionId of GetJoinedSessionsResponse.clientSessions) {
                                    logger.debug(`UpdateFiles ${sessionId}`);

                                    WSServer.clients.forEach(function each(client: any) {
                                        if (client.readyState == ws.OPEN && client.id == sessionId) {
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
