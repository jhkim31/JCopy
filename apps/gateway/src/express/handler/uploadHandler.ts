import { NextFunction, Request, Response } from "express";
import logger from "@config/logger";
import { CreateRoomRequest, CreateRoomResponse, GetLeftStorageRequest, GetLeftStorageResponse, GetTextRequest, GetTextResponse } from "jcopy-shared/proto/jcopy_pb";
import { v4 as uuid } from "uuid";
import { grpcRoomClient, grpcStorageClient } from "@config/grpc";
import assert from "assert";
import upload from "@config/express/multer";
import IUploadFile from "jcopy-shared/interface/kafka/IUploadFile";
import { kafkaProducer } from "@config/kafka";

export default async function uploadHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const upload_single = upload.single("file");

        const roomId = req.query.room;
        const fileName = req.query.name;
        const fileSize = parseInt(req.headers["content-length"] ?? "");

        if (typeof roomId != "string" || typeof fileName != "string") {
            const error = new Error("(room | name) query 정보가 없습니다.");
            error.name = "BAD_REQUEST";
            throw error;
        }

        if (isNaN(fileSize)) {
            const error = new Error("file size 정보가 잘못되었습니다. (content-length header wrong)");
            error.name = "BAD_REQUEST";
            throw error;
        }

        const getLeftStorageRequest = new GetLeftStorageRequest();

        getLeftStorageRequest.setId(uuid());
        getLeftStorageRequest.setRoomid(roomId);
        getLeftStorageRequest.setSize(fileSize);

        const getLeftStorageResponse = await getLeftStoragePromise(getLeftStorageRequest);

        if (getLeftStorageResponse.getLeftstorage() < 0) {
            res.send(JSON.stringify({
                error: 1,
                msg: "용량 초과",
                file: fileName
            }));
        } else {
            upload_single(req, res, async (err) => {
                if (err) {
                    logger.error(err);
                } else {
                    logger.info(`file uploadable \nfilename : ${fileName}\nfilesize : ${fileSize}`);
                    const kafkaMsg: IUploadFile = {
                        id: uuid(),
                        roomId: roomId,
                        size: fileSize,
                        name: fileName
                    }
                    const kafkaRecord = {
                        topic: "upload_file",
                        messages: [{ value: JSON.stringify(kafkaMsg) }]
                    }
                    await kafkaProducer.send(kafkaRecord)
                        .then((d) => {
                            logger.info(`fileuploader kafka producer success send\n${JSON.stringify(d, null, 4)}`);
                            res.send(JSON.stringify({
                                error: 0,
                                msg : "업로드 되었습니다.",
                                file: fileName
                            }))
                        })
                        .catch(e => {
                            throw new Error(`fileuploader kafka producer fail send\n${JSON.stringify(e, null, 4)}`);
                        })
                }
            })
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