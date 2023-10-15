import * as grpc from "@grpc/grpc-js";
import { GetLeftStorageRequest, GetLeftStorageResponse } from "shared/proto/jcopy_pb";
import logger from "@config/logger";
import { Room } from "@config/mongo";

export default async function getLeftStorage(call: grpc.ServerUnaryCall<GetLeftStorageRequest, GetLeftStorageResponse>, callback: grpc.sendUnaryData<GetLeftStorageResponse>): Promise<void> {
    try {
        const id = call.request.getId();
        const roomId = call.request.getRoomid();
        const size = call.request.getSize();

        logger.debug(`gRPC Room.GetLeftStorage receive data\n${JSON.stringify(call.request.toObject(), null, 4)}`);

        const room = await Room.findOne({ roomId: roomId })
            .then(d => {
                if (d?.roomId == roomId) {
                    logger.info(`grpc Room.GetLeftStorage success get mongodb\n${JSON.stringify(d, null, 4)}`);
                } else {
                    throw new Error(`grpc Room.GetLeftStorage error get mongodb\n${JSON.stringify(d, null, 4)}`);
                }
                return d;
            })
            .catch(e => {
                let message = ""
                if (e instanceof Error) {
                    message = `grpc Room.GetLeftStorage ${e.message}\n${JSON.stringify(call.request.toObject(), null, 4)}`;                    
                } else {
                    message = `gRPC Room.GetLeftStorage mongo get room error\n${JSON.stringify(call.request.toObject(), null, 4)}`;                    
                }
                throw new Error(message);
            })
        const leftStorage = room.leftStorage;
        const reply = new GetLeftStorageResponse();
        reply.setId(id);
        reply.setRoomid(roomId);
        reply.setLeftstorage(leftStorage - size);

        callback(null, reply);        
    } catch (e: unknown) {
        if (e instanceof Error) {
            logger.error(e.stack);
            callback(e);
        } else {
            logger.error(`gRPC Room.GetLeftStorage 알 수 없는 에러 \n${e}`);
            callback(new Error("unknown error"));
        }
    }
}
