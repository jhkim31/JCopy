import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ noServer: true });
const wsClients: {[clientId: string]: WebSocket} = {};

export default wss;
export {wsClients};