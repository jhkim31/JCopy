import staticPath from "shared/lib/staticPath"
import dotenv from "dotenv";
if (process.env.NODE_ENV == "production") {
    dotenv.config();
} else if (process.env.NODE_ENV == "development") {
    dotenv.config({path: staticPath("../../.env")});
} else {
    dotenv.config();
}

import assert from "assert";
import { kafkaConsumer } from "@config/kafka";
import eachMessageHandler from "@kafka/eachMessageHandler";
import logger from "@config/logger";
import Express from "@config/express";
import { Request } from "express";
import wss from "@config/ws";
import wsConnectionHandler from "./ws/wsConnectionHandler";
import ErrorHandler from "./express/handler/ErrorHandler";
import * as handler from "@express/handler";

const EXPRESS_PORT = process.env.EXPRESS_PORT as string;

assert.strictEqual(typeof EXPRESS_PORT, "string", "EXPRESS_PORT 가 선언되지 않았습니다.")
kafkaConsumer.run({
    eachMessage: eachMessageHandler
})

Express.get('/', handler.ELBHandler);
Express.get('/home', handler.pageHandler);
Express.get('/joinroom', handler.pageHandler);
Express.get('/room/*', handler.pageHandler);
Express.get('/text', handler.getTextHandler);
Express.get('/uploadable', handler.getUploadableHandler);
Express.get("*", handler.defaultHandler);

Express.post("/room", handler.postRoomHandler);
Express.post('/joinroom', handler.postJoinRoomHandler);
Express.put("/upload", handler.uploadHandler);
Express.delete("/file", handler.deleteFileHandler);

Express.use(ErrorHandler);

const server = Express.listen(EXPRESS_PORT, () => {
    logger.info(`WAS Listen : ${EXPRESS_PORT}`);
})


wss.on('connection', wsConnectionHandler);

server.on('upgrade', (req: Request, socket, head) => {     
    const path = req.url;
    if (path === "/ws"){
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
        });
    }    
})


