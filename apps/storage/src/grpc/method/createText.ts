import * as grpc from "@grpc/grpc-js";
import { CreateTextRequest, CreateTextResponse } from "@shared/proto/jcopy_pb";
import { v4 as uuid } from "uuid";
import redisClient from "@config/redis";

/**
 * grpc Storage.CreateText 구현체.
 * @param call
 * @param callback
 */

export default async function createText(call: grpc.ServerUnaryCall<CreateTextRequest, CreateTextResponse>, callback: grpc.sendUnaryData<CreateTextResponse>): Promise<void> {
    try {
        console.log(call.request);
        const id = call.request.getId();
        const expireTime = call.request.getExpiretime();
        const textId = `text:${uuid()}`;
        const reply = new CreateTextResponse();

        const redisResult = await redisClient
            .set(textId, "", { PXAT: new Date(expireTime).getTime() })
            .catch((e) => {
                console.error(e);
            });

        if (typeof redisResult != "string") {
            throw new Error("Redis CreateText init error");
        }

        reply.setId(id);
        reply.setTextid(textId);
        callback(null, reply);
    } catch (e: unknown) {
        if (e instanceof Error) {
            callback(e, null);
        } else {
            callback(new Error("텍스트를 만드는중 에러가 발생했습니다. (gRPC Server CreateText)"), null);
        }
    }
}
