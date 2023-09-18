import * as grpc from "@grpc/grpc-js";
import { GetFilesRequest, GetFilesResponse } from "@shared/proto/jcopy_pb";
import redisClient from "@config/redis";

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

        const textValue = await redisClient
            .get(textId)
            .catch((e) => {
                console.error(`Redis Read TextID Error \n${JSON.stringify(e, null, 4)}`);
            });

        if (typeof textValue != "string") {
            throw new Error(`Redis Read TextID Error ${textId}`);
        }


        reply.setId(id);
        reply.setTextvalue(textValue);
        reply.setFilenamesList(fileIds);
        callback(null, reply);
    } catch (e: unknown) {
        if (e instanceof Error) {
            callback(e, null);
        } else {
            callback(new Error("파일리스트를 가져오는중 에러가 발생했습니다 (gRPC Server GetFiles)"));
        }
    }
}
