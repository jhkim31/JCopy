import * as grpc from "@grpc/grpc-js";
import { GetTextRequest, GetTextResponse } from "@shared/proto/jcopy_pb";
import redisClient from "@config/redis";

export default async function getText(call: grpc.ServerUnaryCall<GetTextRequest, GetTextResponse>, callback: grpc.sendUnaryData<GetTextResponse>): Promise<void> {
  try {
    const id = call.request.getId();
    const textId = call.request.getTextid();
    const reply = new GetTextResponse();

    const textValue = await redisClient.get(textId);

    if (textValue == null) {
        throw new Error(`Redis Read TextID Error ${textId}`);
    }

    reply.setId(id);
    reply.setTextvalue(textValue);
    callback(null, reply);
  } catch (e: unknown) {
    callback(
      new Error(
        "텍스트를 가져오는중 에러가 발생했습니다. (gRPC Server GetText)"
      ),
      null
    );
  }
}
