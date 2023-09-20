import {ServerUnaryCall, sendUnaryData, ServiceError} from "@grpc/grpc-js";
import { CreateRoomRequest, CreateRoomResponse, CreateTextRequest, CreateTextResponse } from "jcopy-shared/proto/jcopy_pb";
import { grpcStorageClient } from "@config/grpc";
import { v4 as uuid } from "uuid";
import logger from "@config/logger";
import { Room } from "@config/mongo";

export default async function createRoom(call: ServerUnaryCall<CreateRoomRequest, CreateRoomResponse>, callback: sendUnaryData<CreateRoomResponse>): Promise<void> {
    try {
        const id = call.request.getId();
        const clientSession = call.request.getClientsession();
        const expireTime = call.request.getExpiretime();
        const num = call.request.getNum();

        logger.debug(`gRPC Room.CreateRoom receive data\n${JSON.stringify(call.request.toObject(), null, 4)}`);
        const roomId = Math.round(Math.random() * 10000)
            .toString()
            .padStart(4, "0");

        const createTextRequest = new CreateTextRequest();
        createTextRequest.setId(uuid());
        createTextRequest.setExpiretime(expireTime);

        const createTextResponse = await createTextPromise(createTextRequest);

        if (!(createTextResponse instanceof CreateTextResponse)) {
            throw createTextResponse;
        }

        logger.debug(`gRPC Room.CreateRoom CreateTextResponse\n${JSON.stringify(createTextResponse.toObject(), null, 4)}`);

        const textId = createTextResponse.getTextid();

        const roomData = {
            roomId: roomId,
            sessions: [clientSession],
            textId: textId,
            leftStorage: 10_000_000,
            fileIds: [],
            expireAt: new Date(expireTime),
            expireTime: new Date(expireTime),
        };
        
        const room = new Room(roomData);

        await room.save()
            .then(d => {
                if (d?.roomId == roomId){
                    logger.info(`grpc Room.CreateRoom success save mongodb\n${JSON.stringify(d, null, 4)}`);
                } else {
                    throw new Error(`grpc Room.CreateRoom error save mongodb\n${JSON.stringify(d, null, 4)}`);
                }                
            })
            .catch(e => {
                if (e instanceof Error){
                    throw new Error(`grpc Room.CreateRoom ${e.message}\n${JSON.stringify(roomData, null, 4)}`);
                } else {
                    throw new Error(`gRPC Room.CreateRoom error save mongodb\n${JSON.stringify(roomData, null, 4)}`);
                }          
            });
        

        const reply = new CreateRoomResponse();
        reply.setId(id);
        reply.setTextid(textId);
        reply.setRoomid(roomId);
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

async function createTextPromise(createTextRequest: CreateTextRequest): Promise<ServiceError | CreateTextResponse> {
    return new Promise((resolve, reject) => {
        grpcStorageClient.createText(createTextRequest, (error, response: CreateTextResponse) => {
            if (error) {
                reject(error);
            } else {
                resolve(response)
            }
        })
    })
}