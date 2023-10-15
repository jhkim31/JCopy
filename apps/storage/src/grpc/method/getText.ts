import {ServerUnaryCall, sendUnaryData} from "@grpc/grpc-js";
import { GetTextRequest, GetTextResponse } from "shared/proto/jcopy_pb";
import redisClient from "@config/redis";
import logger from "@config/logger";

export default async function getText(call: ServerUnaryCall<GetTextRequest, GetTextResponse>, callback: sendUnaryData<GetTextResponse>): Promise<void> {
    try {
        const id = call.request.getId();
        const textId = call.request.getTextid();
        const reply = new GetTextResponse();

        logger.debug(`gRPC Storage.GetText receive data\n${JSON.stringify(call.request.toObject(), null, 4)}`);

        const textValue = await redisClient
            .get(textId)
            .then((textValue) => {
                if (typeof textValue == "string") {
                    logger.info(`gRPC Storage.GetText success get redis\n${JSON.stringify(call.request.toObject(), null, 4)}`);
                } else {
                    throw new Error(`gRPC Storage.GetText redis error\n${JSON.stringify(call.request.toObject(), null, 4)}`);
                }
                return textValue;
            })
            .catch((e) => {
                if (e instanceof Error) {
                    throw new Error(`${e.message}\n${JSON.stringify(call.request.toObject(), null, 4)}`);
                } else {
                    throw new Error(`gRPC Storage.GetText redis error\n${JSON.stringify(call.request.toObject(), null, 4)}`);
                }
            });

        reply.setId(id);
        reply.setTextvalue(textValue);
        callback(null, reply);
    } catch (e: unknown) {
        if (e instanceof Error) {
            logger.error(e.stack);
            callback(e);
        } else {
            logger.error(`gRPC Storage.GetText 알 수 없는 에러 \n${e}`);
            callback(new Error("unknown error"));
        }
    }
}
