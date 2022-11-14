const express = require("express");
const session = require("express-session");
var RedisStore = require("connect-redis")(session);
const {createClient} = require("redis");

const wsModule = require("ws");
const {v4: uuidv4} = require("uuid");

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

var kafka = require("kafka-node");
var Producer = kafka.Producer;
var kafkaClient = new kafka.KafkaClient();
var producer = new Producer(kafkaClient);

var Consumer = kafka.Consumer;
var consumer = new Consumer(kafkaClient, [{topic: "TextChanged", partition: 0}], {
    autoCommit: true,
});

const redisClient = createClient({url: "redis://localhost:6379", legacyMode: true});
redisClient.connect();

const PROTO_FILE = __dirname + "/../proto/jcopy.proto";

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
const gRPCRoomServiceClient = new RoomService("localhost:5000", grpc.credentials.createInsecure());
const gRPCStorageServiceClient = new StorageService("localhost:5001", grpc.credentials.createInsecure());

const Express = express();

Express.use(express.static(__dirname + "/build"));

Express.use(
    session({
        store: new RedisStore({client: redisClient}),
        secret: "Rs89I67YEA55cLMgi0t6oyr8568e6KtD",
        resave: false,
        saveUninitialized: true,
        cookie: {
            expires: 600000, // 10분 만료
        },
    })
);

Express.get("/home", (req, res) => {
    var session = req.session;
    if (session?.wsID == undefined) {
        session.wsID = session.id;
    }

    res.sendFile(__dirname + "/index.html");
});

Express.post("/room", (req, res) => {

    const CreateRoomRequest = {
        clientSession: req.session.id,
        expireTime: req.session.cookie._expires,
    };

    gRPCRoomServiceClient.CreateRoom(CreateRoomRequest, (error, CreateRoomResponse) => {
        if (error) {

        } else {

            gRPCStorageServiceClient.GetText({textId: CreateRoomResponse.textId}, (error, getTextResponse) => {
                res.send({
                    roomId: CreateRoomResponse.roomId,
                    text: {
                        id: CreateRoomResponse.textId,
                        value: getTextResponse.textValue,
                    },
                });
            });
        }
    });
});

Express.post("/joinroom", (req, res) => {

    const JoinRoomRequest = {
        clientSession: req.session.id,
        roomId: req.query.roomId,
    };

    gRPCRoomServiceClient.JoinRoom(JoinRoomRequest, (error, JoinRoomResponse) => {


        gRPCStorageServiceClient.GetFiles(
            {textId: JoinRoomResponse.textId, fileIds: JoinRoomResponse.fileIds},
            (error, GetFilesResponse) => {
                res.send({
                    roomId: JoinRoomResponse.roomId,
                    text: {
                        id: JoinRoomResponse.textId,
                        value: GetFilesResponse.textValue,
                    },
                    files: GetFilesResponse.fileNames,
                });
            }
        );
    });
});

Express.get("/room/*", (req, res) => {

    res.sendFile(__dirname + "/index.html");
});

Express.get("*", function (req, res) {

    res.status(404).redirect("/home");
});

var HTTPServer = Express.listen(3000);

const WSServer = new wsModule.Server({
    server: HTTPServer,
});

const connectedWebsockets = {};
WSServer.on("connection", async (ws, request) => {
    if (ws.id) {
    } else {
        for (const header of request.rawHeaders) {
            if (header.includes("connect.sid")) {
                const session = header.replace("connect.sid=s%3A", "").split(".")[0];
                ws.id = JSON.parse(await redisClient.v4.get(`sess:${session}`)).wsID;
                connectedWebsockets[ws.id] = ws;
            }
        }
    }

    console.log(`현재 모든 웹소켓 : ${Object.keys(connectedWebsockets)}`);

    ws.on("message", (msg) => {
        const wsMsg = JSON.parse(msg);
        const kafkaMsg = {
            textId: wsMsg.textId,
            textValue: wsMsg.textValue,
            clientSession: ws.id,
        };

        data = {topic: "ChangeText", messages: JSON.stringify(kafkaMsg), partition: 0};

        producer.send([data], (err, res) => {
            if (err){
                console.log("ChangeText Error")
            } else {
                console.log("ChangeText OK")
            }
        });
    });
});

consumer.on("message", async (message) => {
    console.log("TextChanged 이벤트", message);
    try {
        const msg = JSON.parse(message.value);
        if (message.topic == "TextChanged") {
            const GetJoinedSessionsRequest = {
                textId: msg.textId,
                clientSession: msg.clientSession
            }
            console.log('메시지 바꾼 세션 : ', msg.clientSession)
            gRPCRoomServiceClient.GetJoinedSessions(GetJoinedSessionsRequest, (error, GetJoinedSessionsResponse) => {


                for (const sessionId of GetJoinedSessionsResponse.clientSessions){
                    if (msg.clientSession != sessionId){
                        console.log('전송할 세션 : ', sessionId)
                        const ws = connectedWebsockets[sessionId];
                        ws.send(msg.textValue);
                    }
                }

            });
        }
    } catch (e) {

    }
});
