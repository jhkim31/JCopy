import * as grpc from "@grpc/grpc-js";
import { GetJoinedClientIdsRequest, GetJoinedClientIdsResponse } from "jcopy-shared/proto/jcopy_pb";
import logger from "@config/logger";
import { Room } from "@config/mongo";

export default async function GetJoinedClientIds(call: grpc.ServerUnaryCall<GetJoinedClientIdsRequest, GetJoinedClientIdsResponse>, callback: grpc.sendUnaryData<GetJoinedClientIdsResponse>): Promise<void> {
    try {
        const id = call.request.getId();
        const roomId = call.request.getRoomid();
        const clientId = call.request.getClientid();
        logger.debug(`gRPC Room.GetJoinedClientIds receive data\n${JSON.stringify(call.request.toObject(), null, 4)}`);

        const room = await Room.findOne({ roomId: roomId })
            .then(d => {
                if (d?.roomId == roomId) {
                    logger.info(`grpc Room.GetJoinedClientIds success get mongodb\n${JSON.stringify(d, null, 4)}`);
                } else {
                    throw new Error(`grpc Room.GetJoinedClientIds error get mongodb\n${JSON.stringify(d, null, 4)}`);
                }
                return d;
            })
            .catch(e => {
                let message = ""
                if (e instanceof Error) {
                    message = `grpc Room.GetJoinedClientIds ${e.message}\n${JSON.stringify(call.request.toObject(), null, 4)}`;                    
                } else {
                    message = `gRPC Room.GetJoinedClientIds mongo get room error\n${JSON.stringify(call.request.toObject(), null, 4)}`;                    
                }
                throw new Error(message);
            });
                
        const reply = new GetJoinedClientIdsResponse();
        reply.setId(id);
        reply.setRoomid(roomId);
        reply.setClientidsList(room.clientIds);        
        reply.setLeftstorage(room.leftStorage);
        callback(null, reply);        
    } catch (e: unknown) {
        if (e instanceof Error) {
            logger.error(e.stack);
            callback(e);
        } else {
            logger.error(`gRPC Room.GetJoinedClientIds 알 수 없는 에러 \n${e}`);
            callback(new Error("unknown error"));
        }
    }
}
