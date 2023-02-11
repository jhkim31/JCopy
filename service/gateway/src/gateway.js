"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = __importDefault(require("./logger"));
var yaml_1 = __importDefault(require("yaml"));
var fs_1 = __importDefault(require("fs"));
var express_1 = __importDefault(require("express"));
var express_session_1 = __importDefault(require("express-session"));
var connect_redis_1 = __importDefault(require("connect-redis"));
var redis_1 = require("redis");
var ws_1 = __importDefault(require("ws"));
var uuid_1 = require("uuid");
var grpc_js_1 = __importDefault(require("@grpc/grpc-js"));
var proto_loader_1 = __importDefault(require("@grpc/proto-loader"));
var cors_1 = __importDefault(require("cors"));
var kafkajs_1 = require("kafkajs");
var multer_1 = __importDefault(require("multer"));
var multer_s3_1 = __importDefault(require("multer-s3"));
var client_s3_1 = require("@aws-sdk/client-s3");
var expressHandler_1 = require("./handler/expressHandler");
// aws.config.loadFromPath("./s3.json");
// const s3 = new aws.S3();
var RedisStore = (0, connect_redis_1.default)(express_session_1.default);
var s3Config = new client_s3_1.S3Client({
    region: "ap-northeast-2",
    credentials: {
        accessKeyId: 'AKIAVV42TBGWRKIQ4XFC',
        secretAccessKey: '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'
    }
});
var upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3Config,
        bucket: "jcopy-storage",
        key: function (req, file, cb) {
            file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8");
            cb(null, req.query.room + "/" + file.originalname);
        },
    }),
});
var config = null;
if (process.env.NODE_ENV == "develop") {
    var file = fs_1.default.readFileSync("../../config.yaml", "utf8");
    config = yaml_1.default.parse(file).develop;
}
if (process.env.NODE_ENV == "production") {
    var file = fs_1.default.readFileSync("./config.yaml", "utf8");
    config = yaml_1.default.parse(file).deploy;
}
logger_1.default.info("[1-001-01] config\n".concat(yaml_1.default.stringify(config)));
var kafka = new kafkajs_1.Kafka({
    brokers: config.kafka.brokers,
    logLevel: kafkajs_1.logLevel.ERROR,
});
var PROTO_FILE = './jcopy.proto';
var gRPCOptions = {
    keepCase: true,
    longs: Number,
    defaults: true,
    oneofs: true,
};
var pkgDefs = proto_loader_1.default.loadSync(PROTO_FILE, gRPCOptions);
var gRPCDef = grpc_js_1.default.loadPackageDefinition(pkgDefs);
var gRPCRoomServiceClient = new gRPCDef.RoomService("".concat(config.grpc.RoomService.host, ":").concat(config.grpc.RoomService.port), grpc_js_1.default.credentials.createInsecure());
;
var gRPCStorageServiceClient = new gRPCDef.StorageService("".concat(config.grpc.StorageService.host, ":").concat(config.grpc.StorageService.port), grpc_js_1.default.credentials.createInsecure());
var producer = kafka.producer({ createPartitioner: kafkajs_1.Partitioners.LegacyPartitioner });
var consumer = kafka.consumer({ groupId: config.kafka.groupid.gateway });
var redisClient = (0, redis_1.createClient)({ url: "redis://".concat(config.redis.host, ":").concat(config.redis.port), legacyMode: true });
var Express = (0, express_1.default)();
Express.use(express_1.default.static("./build"));
Express.use((0, cors_1.default)());
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, producer.connect()];
            case 1:
                _a.sent();
                return [4 /*yield*/, consumer.connect()];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
try {
    redisClient.connect();
}
catch (e) {
}
Express.use((0, express_session_1.default)({
    store: new RedisStore({ client: redisClient }),
    secret: (0, uuid_1.v4)(),
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60, // 60분
    },
}));
Express.get("/", function (req, res) {
    var _a;
    if ((_a = req.headers["user-agent"]) === null || _a === void 0 ? void 0 : _a.includes("ELB-HealthChecker")) {
        res.send("health check");
        req.session.destroy(function (err) {
            console.log("\uC138\uC158 \uC0AD\uC81C \uC5D0\uB7EC : ".concat(err));
        });
    }
    else {
        logger_1.default.info("[1-401-00] ".concat(req.method, " ").concat(req.originalUrl, " ").concat(req.socket.remoteAddress, "  ").concat(JSON.stringify(req.params), " | session-id : ").concat(req.session.id));
        res.redirect("/home");
    }
});
Express.get("/home", expressHandler_1.defaultHandler);
Express.get("/joinroom", expressHandler_1.defaultHandler);
Express.get("/room/*", expressHandler_1.defaultHandler);
Express.get("/text", function (req, res) {
    var _a;
    logger_1.default.info("[1-405-00] ".concat(req.method, " ").concat(req.originalUrl, " ").concat(req.socket.remoteAddress, "  ").concat(JSON.stringify(req.params), " | session-id : ").concat(req.session.id));
    var GetTextRequest = {
        id: (0, uuid_1.v4)(),
        textId: (_a = req.params) === null || _a === void 0 ? void 0 : _a.id,
    };
    console.log(req.params);
    logger_1.default.debug("  [1-103-00] gRPC Request GetTextRequest : ".concat(JSON.stringify(GetTextRequest)));
    gRPCStorageServiceClient.GetText(GetTextRequest, function (error, GetTextResponse) {
        var _a;
        if (error) {
            logger_1.default.error("  [1-103-51] gRPC GetText Error RPC_ID : ".concat(GetTextRequest.id, " | ").concat(error));
            res.send("");
        }
        else {
            logger_1.default.debug("  [1-103-01] gRPC Response GetTextResponse : ".concat(JSON.stringify(GetTextResponse)));
            logger_1.default.info("[1-405-21] GET /text [".concat((_a = req.params) === null || _a === void 0 ? void 0 : _a.id, "] Response : ").concat(GetTextResponse === null || GetTextResponse === void 0 ? void 0 : GetTextResponse.textValue));
            res.send(GetTextResponse === null || GetTextResponse === void 0 ? void 0 : GetTextResponse.textValue);
        }
    });
});
Express.get("/uploadable", function (req, res) {
    var _a, _b;
    var roomId = (_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.roomId;
    var size = parseInt((_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.size);
    var GetLeftStorageRequest = {
        id: (0, uuid_1.v4)(),
        roomId: roomId,
        size: size,
    };
    gRPCRoomServiceClient.GetLeftStorage(GetLeftStorageRequest, function (error, GetLeftStorageResponse) {
        if (error) {
        }
        else {
            if (GetLeftStorageResponse.leftStorage < 0) {
                res.send({
                    res: 0,
                    msg: "용량 없음",
                });
            }
            else {
                res.send({
                    res: 1,
                    msg: "용량 있음",
                });
            }
        }
    });
});
Express.get("*", function (req, res) {
    logger_1.default.info("[1-499-00] ".concat(req.method, " ").concat(req.originalUrl, " ").concat(req.socket.remoteAddress, "  ").concat(JSON.stringify(req.params), " | session-id : ").concat(req.session.id));
    res.status(404).redirect("/home");
});
Express.post("/room", function (req, res) {
    logger_1.default.info("[1-501-00] ".concat(req.method, " ").concat(req.originalUrl, " ").concat(req.socket.remoteAddress, "  ").concat(JSON.stringify(req.params), " | session-id : ").concat(req.session.id));
    var CreateRoomRequest = {
        id: (0, uuid_1.v4)(),
        clientSession: req.session.id,
        expireTime: new Date(new Date().getTime() + 1000 * 60 * 5).getTime(),
    };
    logger_1.default.debug("  [1-101-00] gRPC Request CreateRoomRequest : ".concat(JSON.stringify(CreateRoomRequest)));
    gRPCRoomServiceClient.CreateRoom(CreateRoomRequest, function (error, CreateRoomResponse) {
        if (error) {
            logger_1.default.error("  [1-101-51] gRPC CreateRoomRequest Error RPC_ID : ".concat(CreateRoomRequest.id, " | ").concat(error));
        }
        else {
            logger_1.default.debug("  [1-101-01] gRPC Response CreateRoomResponse : ".concat(JSON.stringify(CreateRoomResponse)));
            var GetTextRequest_1 = {
                id: (0, uuid_1.v4)(),
                textId: CreateRoomResponse === null || CreateRoomResponse === void 0 ? void 0 : CreateRoomResponse.textId,
            };
            logger_1.default.debug("  [1-103-00] gRPC Send GetTextRequest : ".concat(JSON.stringify(GetTextRequest_1)));
            gRPCStorageServiceClient.GetText(GetTextRequest_1, function (error, GetTextResponse) {
                if (error) {
                    logger_1.default.error("    [1-103-51] gRPC GetText Error RPC_ID : ".concat(GetTextRequest_1.id, " | ").concat(error));
                }
                else {
                    logger_1.default.debug("    [1-103-01] gRPC Recv GetTextResponse : ".concat(JSON.stringify(GetTextResponse)));
                    var wsResult = {
                        roomId: CreateRoomResponse === null || CreateRoomResponse === void 0 ? void 0 : CreateRoomResponse.roomId,
                        text: {
                            id: CreateRoomResponse === null || CreateRoomResponse === void 0 ? void 0 : CreateRoomResponse.textId,
                            value: GetTextResponse === null || GetTextResponse === void 0 ? void 0 : GetTextResponse.textValue,
                        },
                    };
                    logger_1.default.info("[1-501-21] POST /room [".concat(req.socket.remoteAddress, "] Response : ").concat(JSON.stringify(wsResult)));
                    res.send(wsResult);
                }
            });
        }
    });
});
Express.post("/joinroom", function (req, res) {
    var session = req.session;
    logger_1.default.info("[1-502-00] ip : ".concat(req.socket.remoteAddress, " | session-id : ").concat(session.id, " ").concat(req.method, " ").concat(req.originalUrl, " param : ").concat(JSON.stringify(req.params)));
    var JoinRoomRequest = {
        id: (0, uuid_1.v4)(),
        clientSession: req.session.id,
        roomId: req.query.roomId,
    };
    logger_1.default.debug("[1-104-00] gRPC Send JoinRoomRequest : ".concat(JSON.stringify(JoinRoomRequest)));
    gRPCRoomServiceClient.JoinRoom(JoinRoomRequest, function (error, JoinRoomResponse) {
        if (error) {
            logger_1.default.error("  [1-104-51] gRPC JoinRoom Error RPC_ID : ".concat(JoinRoomRequest.id, " | ").concat(error));
        }
        else {
            logger_1.default.debug("  [1-104-01] gRPC Recv JoinRoomResponse : ".concat(JSON.stringify(JoinRoomResponse)));
            if ((JoinRoomResponse === null || JoinRoomResponse === void 0 ? void 0 : JoinRoomResponse.result) == "ok") {
                var GetFilesRequest_1 = {
                    id: (0, uuid_1.v4)(),
                    textId: JoinRoomResponse.textId,
                    fileIds: JoinRoomResponse.fileIds,
                };
                logger_1.default.debug("    [1-105-00] gRPC Send GetFilesRequest : ".concat(JSON.stringify(GetFilesRequest_1)));
                gRPCStorageServiceClient.GetFiles(GetFilesRequest_1, function (error, GetFilesResponse) {
                    if (error) {
                        logger_1.default.error("    [1-105-51] gRPC GetFiles Error RPC_ID : ".concat(GetFilesRequest_1.id, "| ").concat(error));
                    }
                    else {
                        logger_1.default.debug("    [1-105-01] gRPC Recv GetFilesResponse : ".concat(JSON.stringify(GetFilesResponse)));
                        var wsRes = {
                            roomId: JoinRoomResponse.roomId,
                            text: {
                                id: JoinRoomResponse.textId,
                                value: GetFilesResponse === null || GetFilesResponse === void 0 ? void 0 : GetFilesResponse.textValue,
                            },
                            files: GetFilesResponse === null || GetFilesResponse === void 0 ? void 0 : GetFilesResponse.fileNames,
                            error: 0,
                            session: req.session.id,
                            leftStorage: JoinRoomResponse.leftStorage,
                            expireTime: JoinRoomResponse.expireTime,
                        };
                        logger_1.default.info("[1-502-21] POST /joinroom [".concat(req.socket.remoteAddress, "] Response : ").concat(JSON.stringify(wsRes)));
                        res.send(wsRes);
                    }
                });
            }
            else {
                var wsRes = {
                    roomId: JoinRoomResponse === null || JoinRoomResponse === void 0 ? void 0 : JoinRoomResponse.roomId,
                    text: {},
                    files: [],
                    error: 1,
                };
                logger_1.default.info("[1-552-71] POST /joinroom [".concat(req.socket.remoteAddress, "] Response : ").concat(JSON.stringify(wsRes)));
                res.send(wsRes);
            }
        }
    });
});
Express.put("/upload", function (req, res) {
    var _a;
    var upload_single = upload.single("file");
    var GetLeftStorageRequest = {
        id: (0, uuid_1.v4)(),
        roomId: req.query.room,
        size: parseInt((_a = req.headers["content-length"]) !== null && _a !== void 0 ? _a : '0'),
    };
    gRPCRoomServiceClient.GetLeftStorage(GetLeftStorageRequest, function (error, GetLeftStorageResponse) {
        var _a;
        if (error) {
            console.log(error);
        }
        else {
            if ((_a = GetLeftStorageResponse === null || GetLeftStorageResponse === void 0 ? void 0 : GetLeftStorageResponse.leftStorage) !== null && _a !== void 0 ? _a : 0 < 0) {
                var response = {
                    error: 1,
                    msg: "용량초과",
                    file: req.query.name,
                };
                res.send(JSON.stringify(response));
            }
            else {
                upload_single(req, res, function (err) {
                    var _a;
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log(req.query);
                        var kafkaMsg = {
                            id: (0, uuid_1.v4)(),
                            roomId: req.query.room,
                            size: parseInt((_a = req.headers["content-length"]) !== null && _a !== void 0 ? _a : '0'),
                            name: req.query.name,
                        };
                        var kafkaData = { topic: "UploadFile", messages: [{ value: JSON.stringify(kafkaMsg) }] };
                        console.log(kafkaData);
                        producer.send(kafkaData).then(function (d) {
                            if (d) {
                                logger_1.default.debug("  [1-201-01] Produce ChangeText OK ".concat(JSON.stringify(d)));
                            }
                            else {
                                logger_1.default.debug("  [1-201-51] Produce ChangeText error ".concat(d));
                            }
                        });
                        var response = {
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
var HTTPServer = Express.listen(3000);
var WSServer = new ws_1.default.Server({
    server: HTTPServer,
});
WSServer.on("connection", function (ws, request) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, _a, header, session_1;
    var _b, _c;
    return __generator(this, function (_d) {
        for (_i = 0, _a = ((_c = (_b = request === null || request === void 0 ? void 0 : request.headers) === null || _b === void 0 ? void 0 : _b.cookie) !== null && _c !== void 0 ? _c : '').split(";"); _i < _a.length; _i++) {
            header = _a[_i];
            if (header.includes("connect.sid")) {
                session_1 = header.replace("connect.sid=s%3A", "").split(".")[0].trim();
                ws.id = session_1;
                logger_1.default.info("[1-601-00] WebSocket [".concat(session_1, "] connected!!"));
                break;
            }
        }
        ws.on("message", function (msg) { return __awaiter(void 0, void 0, void 0, function () {
            var wsMsg, kafkaMsg, kafkaData;
            return __generator(this, function (_a) {
                logger_1.default.debug("[1-602-00] WS [".concat(ws.id, "] Recv msg : ").concat(msg));
                wsMsg = JSON.parse(msg);
                switch (wsMsg.type) {
                    case "heartbeat":
                        /*
                        TODO:
                        heartbeat때 할 일
                        */
                        break;
                    case "text":
                        kafkaMsg = {
                            id: (0, uuid_1.v4)(),
                            roomId: wsMsg.roomId,
                            textId: wsMsg.textId,
                            textValue: wsMsg.textValue,
                            clientSession: ws.id,
                        };
                        kafkaData = { topic: "ChangeText", messages: [{ value: JSON.stringify(kafkaMsg) }] };
                        logger_1.default.debug("  [1-201-00] Produce ChangeText ".concat(JSON.stringify(kafkaMsg)));
                        producer.send(kafkaData).then(function (d) {
                            if (d) {
                                logger_1.default.debug("  [1-201-01] Produce ChangeText OK ".concat(JSON.stringify(d)));
                            }
                            else {
                                logger_1.default.debug("  [1-201-51] Produce ChangeText error ".concat(d));
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
                return [2 /*return*/];
            });
        }); });
        ws.on("close", function (code, reason) {
            console.log("close ws : ".concat(ws.id));
            console.log(code);
        });
        return [2 /*return*/];
    });
}); });
function kafkaConsumerListener() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    consumer.subscribe({ topics: ["TextChanged", "UpdateFiles"] }).then(function (d) { return console.log("subscribe : ", d); });
                    logger_1.default.info('[1-301-00] Kafka Subscribe Topics "TextChanged"');
                    return [4 /*yield*/, consumer.run({
                            eachMessage: function (_a) {
                                var topic = _a.topic, partition = _a.partition, message = _a.message, heartbeat = _a.heartbeat, pause = _a.pause;
                                return __awaiter(_this, void 0, void 0, function () {
                                    var msg, GetJoinedSessionsRequest_1;
                                    var _b;
                                    return __generator(this, function (_c) {
                                        logger_1.default.debug("[1-302-00] Consume ".concat(topic, " ").concat(message.value));
                                        msg = JSON.parse(((_b = message === null || message === void 0 ? void 0 : message.value) !== null && _b !== void 0 ? _b : '').toString());
                                        // try {
                                        //     logger.debug(`[1-302-01] Parse msg ${msg}`);
                                        // } catch (e) {
                                        //     logger.error(`[1-302-51] Error Parsing Kafka Message ... ${e} | msg : ${(message?.value ?? '').toString()}`);
                                        // }
                                        if (msg != undefined) {
                                            GetJoinedSessionsRequest_1 = {
                                                id: '',
                                                roomId: '',
                                                clientSession: ''
                                            };
                                            switch (topic) {
                                                case "TextChanged":
                                                    GetJoinedSessionsRequest_1 = {
                                                        id: (0, uuid_1.v4)(),
                                                        roomId: msg.roomId,
                                                        clientSession: msg.clientSession,
                                                    };
                                                    logger_1.default.debug("  [1-106-00] gRPC Send GetJoinedSessionsRequest : ".concat(JSON.stringify(GetJoinedSessionsRequest_1)));
                                                    gRPCRoomServiceClient.GetJoinedSessions(GetJoinedSessionsRequest_1, function (error, GetJoinedSessionsResponse) {
                                                        var _a;
                                                        if (error) {
                                                            logger_1.default.error("  [1-106-51] gRPC GetJoinedSessions Error RPC_ID : ".concat(GetJoinedSessionsRequest_1.id, " | ").concat(error));
                                                        }
                                                        else {
                                                            logger_1.default.debug("  [1-106-01] gRPC Recv GetJoinedSessionsResponse : ".concat(JSON.stringify(GetJoinedSessionsResponse)));
                                                            var _loop_1 = function (sessionId) {
                                                                if (msg.clientSession != sessionId) {
                                                                    WSServer.clients.forEach(function each(client) {
                                                                        if (client.readyState == ws_1.default.OPEN && (client === null || client === void 0 ? void 0 : client.id) == sessionId) {
                                                                            logger_1.default.debug("    [1-603-00] WS [".concat(client === null || client === void 0 ? void 0 : client.id, "] Send  msg : ").concat(msg.textValue));
                                                                            var wsMsg = {
                                                                                type: "text",
                                                                                msg: msg.textValue,
                                                                            };
                                                                            client.send(JSON.stringify(wsMsg));
                                                                        }
                                                                    });
                                                                }
                                                            };
                                                            for (var _i = 0, _b = (_a = GetJoinedSessionsResponse === null || GetJoinedSessionsResponse === void 0 ? void 0 : GetJoinedSessionsResponse.clientSessions) !== null && _a !== void 0 ? _a : []; _i < _b.length; _i++) {
                                                                var sessionId = _b[_i];
                                                                _loop_1(sessionId);
                                                            }
                                                        }
                                                    });
                                                    break;
                                                case "UpdateFiles":
                                                    GetJoinedSessionsRequest_1 = {
                                                        id: (0, uuid_1.v4)(),
                                                        roomId: msg.roomId,
                                                        clientSession: msg.clientSession,
                                                    };
                                                    logger_1.default.debug("UpdateFiles  [1-106-00] gRPC Send GetJoinedSessionsRequest : ".concat(JSON.stringify(GetJoinedSessionsRequest_1)));
                                                    gRPCRoomServiceClient.GetJoinedSessions(GetJoinedSessionsRequest_1, function (error, GetJoinedSessionsResponse) {
                                                        if (error) {
                                                            logger_1.default.error("UpdateFiles  [1-106-51] gRPC GetJoinedSessions Error RPC_ID : ".concat(GetJoinedSessionsRequest_1.id, " | ").concat(error));
                                                        }
                                                        else {
                                                            logger_1.default.debug("UpdateFiles  [1-106-01] gRPC Recv GetJoinedSessionsResponse : ".concat(JSON.stringify(GetJoinedSessionsResponse)));
                                                            var _loop_2 = function (sessionId) {
                                                                logger_1.default.debug("UpdateFiles ".concat(sessionId));
                                                                WSServer.clients.forEach(function each(client) {
                                                                    if (client.readyState == ws_1.default.OPEN && client.id == sessionId) {
                                                                        var wsMsg = {
                                                                            type: "file",
                                                                            fileIds: msg.fileIds,
                                                                            leftStorage: GetJoinedSessionsResponse.leftStorage,
                                                                        };
                                                                        logger_1.default.debug("UpdateFiles send : ".concat(sessionId));
                                                                        client.send(JSON.stringify(wsMsg));
                                                                    }
                                                                });
                                                            };
                                                            for (var _i = 0, _a = GetJoinedSessionsResponse.clientSessions; _i < _a.length; _i++) {
                                                                var sessionId = _a[_i];
                                                                _loop_2(sessionId);
                                                            }
                                                        }
                                                    });
                                                    break;
                                            }
                                        }
                                        return [2 /*return*/];
                                    });
                                });
                            },
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
kafkaConsumerListener();
