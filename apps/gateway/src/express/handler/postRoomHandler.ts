import { Request, Response } from "express";
import logger from "@config/logger";
import { GetLeftStorageRequest, GetLeftStorageResponse } from "jcopy-shared/proto/jcopy_pb";
import {v4 as uuid} from "uuid";
import { grpcRoomClient } from "@config/grpc";

export default async function getUploadableHandler(req: Request, res: Response) {
    const clientSession = req.session.id;
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