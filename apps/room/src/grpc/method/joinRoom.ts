import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import { JoinRoomRequest, JoinRoomResponse } from "shared/proto/jcopy_pb";
import { Room } from "@config/mongo";
import logger from "@config/logger";

export default async function joinRoom(call: ServerUnaryCall<JoinRoomRequest, JoinRoomResponse>, callback: sendUnaryData<JoinRoomResponse>): Promise<void> {
    try {
        const id = call.request.getId();
        const roomId = call.request.getRoomid();
        const clientId = call.request.getClientid();

        logger.debug(`gRPC Room.JoinRoom receive data\n${JSON.stringify(call.request.toObject(), null, 4)}`);

        await Room
            .updateOne({ roomId: roomId }, { $addToSet: { clientIds: clientId } })
            .then(d => {
                if (d.modifiedCount == 0) {
                    logger.warn(`grpc Room.JoinRoom mongo room not found : ${roomId}`);
                } else {
                    logger.info(`grpc Room.JoinRoom mongo add clientId to room. \nroomId : ${roomId}\nclientId : ${clientId}`);
                }
            })
            .catch(e => {
                if (e instanceof Error) {
                    throw new Error(`grpc Room.JoinRoom ${e.message}\n${JSON.stringify(call.request.toObject(), null, 4)}`);
                } else {
                    throw new Error(`gRPC Room.JoinRoom mongo update error\n${JSON.stringify(call.request.toObject(), null, 4)}`);
                }
            })

        const room = await Room.findOne({ roomId: roomId })
            .then(d => {
                if (d?.roomId == roomId) {
                    logger.info(`grpc Room.JoinRoom success get mongodb\n${JSON.stringify(d, null, 4)}`);
                } else {
                    throw new Error(`grpc Room.JoinRoom error get mongodb\n${JSON.stringify(d, null, 4)}`);
                }
                return d;
            })
            .catch(e => {
                if (e instanceof Error) {
                    throw new Error(`grpc Room.JoinRoom ${e.message}\n${JSON.stringify(call.request.toObject(), null, 4)}`);
                } else {
                    throw new Error(`gRPC Room.JoinRoom mongo get room error\n${JSON.stringify(call.request.toObject(), null, 4)}`);
                }
            })


        const reply = new JoinRoomResponse();
        if (room) {
            reply.setId(id);
            reply.setResult("ok");
            reply.setRoomid(roomId);
            reply.setTextid(room.textId);
            reply.setFileidsList(room.fileIds);
            reply.setLeftstorage(room.leftStorage);
            reply.setExpiretime(room.expireTime.toString());
        } else {
            reply.setId(id);
            reply.setResult("Not Found Room");
            reply.setRoomid(roomId);
            reply.setTextid("");
            reply.setFileidsList([]);
        }

        callback(null, reply);
    } catch (e: unknown) {
        if (e instanceof Error) {
            logger.error(e.stack);
            callback(e);
        } else {
            logger.error(`gRPC Room.JoinRoom 알 수 없는 에러 \n${e}`);
            callback(new Error("unknown error"));
        }
    }
}
