import path from "path";
import { NextFunction, Request, Response } from "express";
import logger from "@config/logger";
import { GetLeftStorageRequest } from "shared/proto/jcopy_pb";
import {v4 as uuid} from "uuid";

const staticPath = (relative_path: string) => path.resolve(process.cwd(), relative_path);

export default function ErrorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
    logger.error("error handler");
    if (err instanceof Error){
        logger.error(err.stack);
        switch(err.name) {
            case "BAD_REQUEST":
                res.status(400).json({error: 1, msg: err.message});
                break;
            case "INVALID_UPLOAD":
                res.status(400).json({res: 0, msg: err.message});
                break;
            default:                
                res.status(500).send("알 수 없는 에러");                
        }
    } else {        
        logger.error(`알 수 없는 에러 \n${err}`);
        res.status(500).send("알 수 없는 에러");
    }
}