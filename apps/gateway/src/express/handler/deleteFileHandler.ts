import { NextFunction, Request, Response } from "express";
import logger from "@config/logger";
import { v4 as uuid } from "uuid";
import assert from "assert";
import { kafkaProducer } from "@config/kafka";
import s3Client from "@config/aws/s3";
import * as aws from "@aws-sdk/client-s3";
import IDeleteFile from "jcopy-shared/interface/kafka/IDeleteFile";

const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME as string;
assert.strictEqual(typeof AWS_S3_BUCKET_NAME, "string", `AWS_S3_BUCKET_NAME 가 선언되지 않았습니다.`);

export default async function deleteFileHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const roomId = req.query.room;
        const fileName = req.query.name;

        if (typeof roomId != "string" || typeof fileName != "string") {
            const error = new Error("(room | name) query 정보가 없습니다.");
            error.name = "BAD_REQUEST";
            throw error;
        }

        const key = `${roomId}/${fileName}`;
        const deleteCommand = new aws.DeleteObjectCommand({
            Bucket: AWS_S3_BUCKET_NAME,
            Key: key
        });

        await s3Client.send(deleteCommand)
            .then(d => {
                logger.info(`delte file ${key}`);
            })
            .catch(e => {
                const error = new Error('s3 file delete중 에러');
                error.name = "S3_ERROR";
                if (e instanceof Error) {
                    error.message = `s3 file delete중 에러 ${e.message}`;
                }
                throw error;
            });

        const deleteFile: IDeleteFile = {
            id: uuid(),
            roomId: roomId,
            name: fileName
        }
        const kafkaRecord = {
            topic: "delete_file",
            messages: [{ value: JSON.stringify(deleteFile) }]
        }
        await kafkaProducer.send(kafkaRecord)
            .then((d) => {
                logger.info(`delete file kafka producer success send\n${JSON.stringify(d, null, 4)}`);
            })
            .catch(e => {
                throw new Error(`delete file kafka producer fail send\n${JSON.stringify(e, null, 4)}`);
            })
    } catch (e: unknown) {
        if (e instanceof Error) {
            next(e);
        } else {
            next(new Error("unknown Error"));
        }
    }
}