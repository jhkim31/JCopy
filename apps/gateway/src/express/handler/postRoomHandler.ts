import { NextFunction, Request, Response } from "express";
import logger from "@config/logger";
import { CreateRoomRequest, CreateRoomResponse, GetLeftStorageRequest, GetLeftStorageResponse, GetTextRequest, GetTextResponse } from "jcopy-shared/proto/jcopy_pb";
import { v4 as uuid } from "uuid";
import { grpcRoomClient, grpcStorageClient } from "@config/grpc";
import assert from "assert";

const ROOM_EXPIRE_TIME = process.env.ROOM_EXPIRE_TIME as string;
assert.strictEqual(typeof ROOM_EXPIRE_TIME, "string", `ROOM_EXPIRE_TIME 가 선언되지 않았습니다.`);
const ROOM_EXPIRE_TIME_N = parseInt(ROOM_EXPIRE_TIME);
assert.strictEqual(isNaN(ROOM_EXPIRE_TIME_N), false, `ROOM_EXPIRE_TIME 가 정상적으로 선언되지 않았습니다. ${ROOM_EXPIRE_TIME}`);

export default async function postRoomHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const clientId = req.query.clientId;

        if (typeof clientId !== "string") {
            const error = new Error('empty clientId');
            error.name = "BAD_REQUEST";
            throw error;
        }

        const createRoomRequest = new CreateRoomRequest();
        createRoomRequest.setId(uuid());
        createRoomRequest.setClientid(clientId);
        createRoomRequest.setExpiretime(new Date(new Date().getTime() + ROOM_EXPIRE_TIME_N).getTime());
        const createRoomResponse = await createRoomPromise(createRoomRequest);

        const getTextRequest = new GetTextRequest();
        getTextRequest.setId(uuid());
        getTextRequest.setTextid(createRoomResponse.getTextid());

        const getTextResponse = await getTextPromise(getTextRequest);

        res.send({
            roomId: createRoomResponse.getRoomid(),
            text: {
                id: createRoomResponse.getTextid(),
                value: getTextResponse.getTextvalue()
            }
        });
    } catch (e: unknown) {
        if (e instanceof Error) {
            next(e);
        } else {
            next(new Error("unknown Error"));
        }
    }
}

async function createRoomPromise(createRoomRequest: CreateRoomRequest): Promise<CreateRoomResponse> {
    return new Promise((resolve, reject) => {
        grpcRoomClient.createRoom(createRoomRequest, (err, response: CreateRoomResponse) => {
            if (err) {
                reject(err);
            } else {
                resolve(response);
            }
        })
    })
}

async function getTextPromise(getTextRequest: GetTextRequest): Promise<GetTextResponse> {
    return new Promise((resolve, reject) => {
        grpcStorageClient.getText(getTextRequest, (err, response: GetTextResponse) => {
            if (err) {
                reject(err);
            } else {
                resolve(response);
            }
        })
    })
}