import dotenv from "dotenv";
dotenv.config();

import assert from "assert";
import { kafkaConsumer } from "@config/kafka";
// import eachMessageHandler from "@kafka/eachMessageHandler";
import logger from "@config/logger";
import Express from "@config/express";
import { Request } from "express";
import wss from "@config/ws";
import {v4 as uuid} from "uuid";
import WebSocket from "ws";
import wsConnectionHandler from "./ws/wsConnectionHandler";
import ErrorHandler from "./express/handler/ErrorHandler";

import { wsClients } from "@config/ws";
const EXPRESS_PORT = process.env.EXPRESS_PORT as string;

assert.strictEqual(typeof EXPRESS_PORT, "string", "EXPRESS_PORT 가 선언되지 않았습니다.")
// kafkaConsumer.run({
//     eachMessage: eachMessageHandler
// })


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


