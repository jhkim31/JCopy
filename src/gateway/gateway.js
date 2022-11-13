const express = require("express");
const session = require("express-session");
var RedisStore = require("connect-redis")(session);
const {createClient} = require("redis");

const wsModule = require("ws");
const {v4: uuidv4} = require("uuid");

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const redisClient = createClient({url: 'redis://localhost:6379', legacyMode: true});
redisClient.connect();


const PROTO_FILE = "../proto/jcopy.proto";

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

Express.use(express.static("./build"));

Express.use(
    session({
        store: new RedisStore({client: redisClient}),
        secret: "Rs89I67YEA55cLMgi0t6oyr8568e6KtD",
        resave: false,
        saveUninitialized: true,
        cookie: {
            expires: 600000 // 10분 만료
        }
    })
);


Express.get("/home", (req, res) => {
    var session = req.session;
    if (session?.wsID == undefined){
        session.wsID = session.id;
    }
    console.log(session.id)
    console.log(session);
    res.sendFile(__dirname + "/index.html");
});

Express.post("/room", (req, res) => {
    console.log(req.session.cookie)
    console.log(new Date(req.session.cookie._expires))
    const CreateRoomRequest = {
        clientSession: req.session.id ,
        expireTime: req.session.cookie._expires
    }
    console.log('gateway : CreateRoomRequest', CreateRoomRequest)
    gRPCRoomServiceClient.CreateRoom(CreateRoomRequest, (error, CreateRoomResponse) => {
        if (error) {
            console.log(error);
        } else {
            console.log("room id : ", CreateRoomResponse.roomId);
            console.log('text id : ', CreateRoomResponse.textId);
            console.log('file id : ', CreateRoomResponse.fileId);

            gRPCStorageServiceClient.GetText({textId: CreateRoomResponse.textId}, (error, getTextResponse) => {
                console.log(error)
                console.log(getTextResponse)
                res.send({
                    room: CreateRoomResponse.roomId,
                    text : {
                        id : CreateRoomResponse.textId,
                        value : getTextResponse.textValue
                    }
                })
            })

        }
    });
});


Express.get("/room/*", (req, res) => {
    console.log("room!");
    res.sendFile(__dirname + "/index.html");
});


Express.get('*', function(req, res){
    console.log('123')
    res.status(404).redirect('/home')
  });

var HTTPServer = Express.listen(3000);



const WSServer = new wsModule.Server({
    server: HTTPServer,
});

WSServer.on("connection", (ws, request) => {
    ws.id = uuidv4();
    const ip = request.headers["x-forwarded-for"] || request.connection.remoteAddress;

    console.log(`새로운 클라이언트[${ip}] 접속`);

    if (ws.readyState === ws.OPEN) {
        ws.send(`클라이언트[${ip}] 접속을 환영합니다 from 서버`);
    }

    ws.on("message", (msg) => {
        console.log(ws.id);
        console.log(`클라이언트[${ip}]에게 수신한 메시지 : ${msg}`);
        ws.send("메시지 잘 받았습니다! from 서버");
    });

    ws.on("error", (error) => {
        console.log(`클라이언트[${ip}] 연결 에러발생 : ${error}`);
    });

    ws.on("close", () => {
        console.log(`클라이언트[${ip}] 웹소켓 연결 종료`);
    });
});
