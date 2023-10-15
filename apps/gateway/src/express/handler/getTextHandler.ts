import { Request, Response } from "express";
import logger from "@config/logger";
import { GetLeftStorageRequest, GetLeftStorageResponse, GetTextRequest, GetTextResponse } from "shared/proto/jcopy_pb";
import {v4 as uuid} from "uuid";
import { grpcRoomClient, grpcStorageClient } from "@config/grpc";

export default async function getTextHandler(req: Request, res: Response) {
    const textId = req.params.id as string;    

    if (textId == undefined){
        const error = new Error(`${req.url} id가 잘못되었습니다`);
        error.name = "BAD_REQUEST";
        throw error;
    }
    
    const getTextRequest = new GetTextRequest();
    getTextRequest.setId(uuid());
    getTextRequest.setTextid(textId);    
    
    const getTextResponse = await getTextPromise(getTextRequest);

    res.send(getTextResponse.getTextvalue());
}

async function getTextPromise(getTextRequest: GetTextRequest): Promise<GetTextResponse> {
    return new Promise((resolve, reject) => {
        grpcStorageClient.getText(getTextRequest, (err, response: GetTextResponse) => {
            if (err){
                reject(err);
            } else {
                resolve(response);
            }   
        })
    })
}