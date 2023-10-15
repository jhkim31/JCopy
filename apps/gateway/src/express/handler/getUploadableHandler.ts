import { NextFunction, Request, Response } from "express";
import { GetLeftStorageRequest, GetLeftStorageResponse } from "shared/proto/jcopy_pb";
import { v4 as uuid } from "uuid";
import { grpcRoomClient } from "@config/grpc";

export default async function getUploadableHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const roomId = req.query.roomId as string;
        const size = req.query.size as string;
        const fileSize = parseInt(size);

        if (roomId == undefined || isNaN(fileSize) == true) {
            const error = new Error(`${req.url} roomId, size가 잘못되었습니다`);
            error.name = "BAD_REQUEST";
            throw error;
        }

        const getLeftStorageRequest = new GetLeftStorageRequest();
        getLeftStorageRequest.setId(uuid());
        getLeftStorageRequest.setRoomid(roomId);
        getLeftStorageRequest.setSize(fileSize);

        const getLeftStorageResponse = await getLeftStoragePromise(getLeftStorageRequest);

        if (getLeftStorageResponse.getLeftstorage() < 0) {
            const error = new Error();
            error.name = "INVALID_UPLOAD";
            error.message = "용량없음";
            throw error;
        } else {
            res.send({ res: 1, msg: "용량 있음" });
        }
    } catch (e: unknown) {
        if (e instanceof Error) {
            next(e);
        } else {
            next(new Error("unknown Error"));
        }
    }

}

async function getLeftStoragePromise(getLeftStorageRequest: GetLeftStorageRequest): Promise<GetLeftStorageResponse> {
    return new Promise((resolve, reject) => {
        grpcRoomClient.getLeftStorage(getLeftStorageRequest, (err, response: GetLeftStorageResponse) => {
            if (err) {
                reject(err);
            } else {
                resolve(response);
            }
        })
    })
}