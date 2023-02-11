import {Request, Response} from "express";
import logger from "../logger";

const defaultHandler = (req: Request, res: Response) => {
    logger.info(`[1-402-00] ${req.method} ${req.originalUrl} ${req.socket.remoteAddress}  ${JSON.stringify(req.params)} | session-id : ${req.session.id}`);
    res.sendFile("build/index.html", {root: "."});
}

export {defaultHandler};