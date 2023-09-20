import {ServerUnaryCall, sendUnaryData} from "@grpc/grpc-js";
import { CreateTextRequest, CreateTextResponse } from "jcopy-shared/proto/jcopy_pb";
import { v4 as uuid } from "uuid";
import redisClient from "@config/redis";
import logger from "@config/logger";

/**
 * grpc Storage.CreateText 구현체.
 * @param call
 * @param callback
 */

export default async function createText(call: ServerUnaryCall<CreateTextRequest, CreateTextResponse>, callback: sendUnaryData<CreateTextResponse>): Promise<void> {
    try {
        const id = call.request.getId();
        const expireTime = call.request.getExpiretime();
        const textId = `text:${uuid()}`;        

        logger.debug(`gRPC Storage.CreateText receive data\n${JSON.stringify(call.request.toObject(), null, 4)}`);

        await redisClient
            .set(textId, "", { PXAT: new Date(expireTime).getTime() })
            .then(d => {
                if (d == "OK") {
                    logger.info(`grpc Storage.CreateText success set redis\n${JSON.stringify(call.request.toObject(), null, 4)}`);
                } else {                                        
                    throw new Error(`gRPC Storage.CreateText set redis error\n${JSON.stringify(call.request.toObject(), null, 4)}`);
                }
            })
            .catch(e => {    
                if (e instanceof Error){
                    throw new Error(`grpc Storage.CreateText ${e.message}\n${JSON.stringify(call.request.toObject(), null, 4)}`);
                } else {
                    throw new Error(`gRPC Storage.CreateText set redis error\n${JSON.stringify(call.request.toObject(), null, 4)}`);
                }                
            });

        const reply = new CreateTextResponse();
        reply.setId(id);
        reply.setTextid(textId);
        callback(null, reply);
    } catch (e: unknown) {
        if (e instanceof Error) {            
            logger.error(e.stack);
            callback(e);
        } else {
            logger.error(`gRPC Storage.CreateText 알 수 없는 에러 \n${e}`);
            callback(new Error("unknown error"));
        }
    }
}
