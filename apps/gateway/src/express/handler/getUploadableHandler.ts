import { Request, Response } from "express";
import logger from "@config/logger";
import { GetLeftStorageRequest, GetLeftStorageResponse } from "jcopy-shared/proto/jcopy_pb";
import {v4 as uuid} from "uuid";
import { grpcRoomClient } from "@config/grpc";

export default async function getUploadableHandler(req: Request, res: Response) {
    const roomId = req.query.roomId as string;
    const size = req.query.size as string;

    if (roomId == undefined || size == undefined){
        const error = new Error(`${req.url} roomId, size가 잘못되었습니다`);
        error.name = "BAD_REQUEST";
        throw error;
    }
    
    const getLeftStorageRequest = new GetLeftStorageRequest();
    getLeftStorageRequest.setId(uuid());
    getLeftStorageRequest.setRoomid(roomId);
    getLeftStorageRequest.setRoomid(size);
    
    const getLeftStorageResponse = await createGetLeftStoragePromise(getLeftStorageRequest);

    if (getLeftStorageResponse.getLeftstorage() < 0){
        const error = new Error();
        error.name = "INVALID_UPLOAD";
        error.message = "용량없음";
        throw error;        
    } else {
        res.send({res: 1, msg: "용량 있음"});
    }
}

async function createGetLeftStoragePromise(getLeftStorageRequest: GetLeftStorageRequest): Promise<GetLeftStorageResponse> {
    return new Promise((resolve, reject) => {
        grpcRoomClient.getLeftStorage(getLeftStorageRequest, (err, response: GetLeftStorageResponse) => {
            if (err){
                reject(err);
            } else {
                resolve(response);
            }   
        })
    })
}