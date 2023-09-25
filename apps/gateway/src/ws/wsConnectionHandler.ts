import WebSocket from "ws";
import {v4 as uuid} from "uuid";
import onMessageHandler from "./onMessageHandler";
import { wsClients } from "@config/ws";
import logger from "@config/logger";

export default async function wsConnectionHandler(ws: WebSocket) {
    const clientId = uuid();
    logger.info(`ws ${clientId}이 연결되었습니다.`);
    wsClients[clientId] = ws;
    ws.send(JSON.stringify({type: "init", clientId: clientId}));

    setInterval(() => {
        ws.ping();        
    }, 10000);    

    ws.on('close', (message) => {
        delete wsClients[clientId];
        logger.info(`ws ${clientId}의 연결이 끊어졌습니다.`);
    })

    ws.on('pong', (e) => {
        logger.trace(`${clientId} : ws heartbeat`);
    });

    ws.on('message', async (message) => {
        onMessageHandler(ws, clientId, message);
    });
}