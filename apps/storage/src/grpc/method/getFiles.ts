import * as grpc from "@grpc/grpc-js";
import { GetFilesRequest, GetFilesResponse } from "jcopy-shared/proto/jcopy_pb";
import redisClient from "@config/redis";
import logger from "@config/logger";

/**
 * grpc Storage.GetFiles 구현체
 * 
 * @param call 
 * @param callback 
 */
export default async function getFiles(call: grpc.ServerUnaryCall<GetFilesRequest, GetFilesResponse>, callback: grpc.sendUnaryData<GetFilesResponse>): Promise<void> {
    try {
        /**
         * 여기 뭔가 이상함.
         * getFiles인데, 텍스트 벨류만 가져온다.
         */
        const id = call.request.getId();
        const textId = call.request.getTextid();
        const fileIds = call.request.getFileidsList();
        const reply = new GetFilesResponse();

        logger.debug(`gRPC Storage.GetFiles receive data\n${JSON.stringify(call.request.toObject(), null, 4)}`);

        const textValue = await redisClient
            .get(textId)
            .then(textValue => {
                if (typeof textValue == "string") {
                    logger.info(`gRPC Storage.GetFiles success get redis\n${JSON.stringify(call.request.toObject(), null, 4)}`);
                } else {
                    throw new Error(`gRPC Storage.GetFiles redis error\n${JSON.stringify(call.request.toObject(), null, 4)}`);
                }
                return textValue;
            })
            .catch((e) => {
                if (e instanceof Error){
                    throw new Error(`gRPC Storage.GetFiles ${e.message}\n${JSON.stringify(call.request.toObject(), null, 4)}`);
                } else {
                    throw new Error(`gRPC Storage.GetFiles redis error\n${JSON.stringify(call.request.toObject(), null, 4)}`);
                }                
            });

        reply.setId(id);
        reply.setTextvalue(textValue);
        reply.setFilenamesList(fileIds);
        callback(null, reply);
    } catch (e: unknown) {
        if (e instanceof Error) {
            logger.error(e.stack);
            callback(e);
        } else {
            logger.error(`gRPC Storage.GetFiles 알 수 없는 에러 \n${e}`);
            callback(new Error("unknown error"));
        }
    }
}
