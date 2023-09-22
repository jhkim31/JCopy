import { NextFunction, Request, Response } from "express";
import { GetFilesRequest, GetFilesResponse, JoinRoomRequest, JoinRoomResponse } from "jcopy-shared/proto/jcopy_pb";
import { v4 as uuid } from "uuid";
import { grpcRoomClient, grpcStorageClient } from "@config/grpc";

export default async function postJoinRoomHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const clientId = req.query.clientId;
        const roomId = req.query.roomId;

        if (typeof clientId !== "string" || typeof roomId !== "string") {
            const error = new Error('empty clientId or roomId');
            error.name = "BAD_REQUEST";
            throw error;
        }

        const joinRoomRequest = new JoinRoomRequest();
        joinRoomRequest.setId(uuid());
        joinRoomRequest.setClientid(clientId);
        joinRoomRequest.setRoomid(roomId);

        const joinRoomResponse = await joinRoomPromise(joinRoomRequest);

        const getFilesRequest = new GetFilesRequest();
        getFilesRequest.setId(uuid());
        getFilesRequest.setTextid(joinRoomResponse.getTextid());
        getFilesRequest.setFileidsList(joinRoomResponse.getFileidsList());

        const getFilesResponse = await getFilesPromise(getFilesRequest);

        res.send({
            roomId: joinRoomResponse.getRoomid(),
            text: {
                id: joinRoomResponse.getTextid(),
                value: getFilesResponse.getTextvalue(),
            },
            files: getFilesResponse.getFilenamesList(),
            error: 0,
            leftStorage: joinRoomResponse.getLeftstorage(),
            expireTime: joinRoomResponse.getExpiretime(),
        });
    } catch (e: unknown) {
        if (e instanceof Error) {
            next(e);
        } else {
            next(new Error("unknown Error"));
        }
    }
}

async function joinRoomPromise(joinRoomRequest: JoinRoomRequest): Promise<JoinRoomResponse> {
    return new Promise((resolve, reject) => {
        grpcRoomClient.joinRoom(joinRoomRequest, (err, response: JoinRoomResponse) => {
            if (err) {
                reject(err);
            } else {
                resolve(response);
            }
        })
    })
}

async function getFilesPromise(getFilesRequest: GetFilesRequest): Promise<GetFilesResponse> {
    return new Promise((resolve, reject) => {
        grpcStorageClient.getFiles(getFilesRequest, (err, response: GetFilesResponse) => {
            if (err) {
                reject(err);
            } else {
                resolve(response);
            }
        })
    })
}