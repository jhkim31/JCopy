import * as grpc from "@grpc/grpc-js";
import { GetJoinedSessionsRequest, GetJoinedSessionsResponse } from "jcopy-shared/proto/jcopy_pb";
import logger from "@config/logger";
import { Room } from "@config/mongo";

export default async function getJoinedSessions(call: grpc.ServerUnaryCall<GetJoinedSessionsRequest, GetJoinedSessionsResponse>, callback: grpc.sendUnaryData<GetJoinedSessionsResponse>): Promise<void> {
    try {
        const id = call.request.getId();
        const roomId = call.request.getRoomid();
        const clientSession = call.request.getClientsession();
        logger.debug(`gRPC Room.GetJoinedSessions receive data\n${JSON.stringify(call.request.toObject(), null, 4)}`);

        const room = await Room.findOne({ roomId: roomId })
            .then(d => {
                if (d?.roomId == roomId) {
                    logger.info(`grpc Room.GetJoinedSessions success get mongodb\n${JSON.stringify(d, null, 4)}`);
                } else {
                    throw new Error(`grpc Room.GetJoinedSessions error get mongodb\n${JSON.stringify(d, null, 4)}`);
                }
                return d;
            })
            .catch(e => {
                let message = ""
                if (e instanceof Error) {
                    message = `grpc Room.GetJoinedSessions ${e.message}\n${JSON.stringify(call.request.toObject(), null, 4)}`;                    
                } else {
                    message = `gRPC Room.GetJoinedSessions mongo get room error\n${JSON.stringify(call.request.toObject(), null, 4)}`;                    
                }
                throw new Error(message);
            });
                
        const reply = new GetJoinedSessionsResponse();
        reply.setId(id);
        reply.setRoomid(roomId);
        reply.setClientsessionsList(room.sessions);
        reply.setLeftstorage(room.leftStorage);
        callback(null, reply);        
    } catch (e: unknown) {
        if (e instanceof Error) {
            logger.error(e.stack);
            callback(e);
        } else {
            logger.error(`gRPC Room.GetJoinedSessions 알 수 없는 에러 \n${e}`);
            callback(new Error("unknown error"));
        }
    }
}
