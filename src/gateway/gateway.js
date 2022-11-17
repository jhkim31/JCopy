const develop = process.argv[2];
console.log(develop);
const YAML = require("yaml");
const fs = require("fs");

const express = require("express");
const session = require("express-session");
var RedisStore = require("connect-redis")(session);
const {createClient} = require("redis");

const wsModule = require("ws");
const {v4: uuidv4} = require("uuid");

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

var config = null;
if (develop == 'develop') {
    const file = fs.readFileSync("../config.yaml", "utf8");
    console.log(file);
    config = YAML.parse(file).develop;
} else {
    const file = fs.readFileSync("./config.yaml", "utf8");
    console.log(file);
    config = YAML.parse(file).deploy;
}
console.log(config);

var {Kafka, Partitioners} = require("kafkajs");
const kafka = new Kafka({
    brokers: config.kafka.brokers,
});
const producer = kafka.producer({createPartitioner: Partitioners.LegacyPartitioner});
const consumer = kafka.consumer({groupId: config.kafka.groupid.gateway});

(async () => {
    await producer.connect();
    await consumer.connect();
})();

const redisClient = createClient({url: `redis://${config.redis.host}:${config.redis.port}`, legacyMode: true});
redisClient.connect();

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

const gRPCRoomServiceClient = new RoomService(
    `${config.grpc.RoomService.host}:${config.grpc.RoomService.port}`,
    grpc.credentials.createInsecure()
);
const gRPCStorageServiceClient = new StorageService(
    `${config.grpc.StorageService.host}:${config.grpc.StorageService.port}`,
    grpc.credentials.createInsecure()
);

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
    var session = req.session;
    if (session?.wsID == undefined) {
        session.wsID = session.id;
    }

    res.sendFile("index.html", { root: '.' });
});

Express.get("/joinroom", (req, res) => {
    var session = req.session;
    if (session?.wsID == undefined) {
        session.wsID = session.id;
    }

    res.sendFile("index.html", { root: '.' });
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
    if (session?.wsID == undefined) {
        res.redirect("/joinroom");
    }

    res.sendFile("/index.html", { root: '.' });
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

    ws.on("message", async (msg) => {
        const wsMsg = JSON.parse(msg);
        const kafkaMsg = {
            textId: wsMsg.textId,
            textValue: wsMsg.textValue,
            clientSession: ws.id,
        };

        data = {topic: "ChangeText", messages: [{value: JSON.stringify(kafkaMsg)}]};

        await producer.send(data);
    });
});

async function kafkaConsumerListener() {
    await consumer.subscribe({topics: ["TextChanged"]});
    await consumer.run({
        eachMessage: async ({topic, partition, message, heartbeat, pause}) => {
            const msg = JSON.parse(message.value.toString());

            if (topic == "TextChanged") {
                const GetJoinedSessionsRequest = {
                    textId: msg.textId,
                    clientSession: msg.clientSession,
                };
                gRPCRoomServiceClient.GetJoinedSessions(GetJoinedSessionsRequest, (error, GetJoinedSessionsResponse) => {
                    for (const sessionId of GetJoinedSessionsResponse.clientSessions) {
                        if (msg.clientSession != sessionId) {
                            const ws = connectedWebsockets[sessionId];
                            ws.send(msg.textValue);
                        }
                    }
                });
            }
        },
    });
}

kafkaConsumerListener();
