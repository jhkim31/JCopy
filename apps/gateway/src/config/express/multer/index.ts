import multer from "multer";
import multerS3 from "multer-s3";
import s3Client from "@config/aws/s3";
import assert from "assert";
import { Request } from "express";

const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME as string;

assert.strictEqual(typeof AWS_S3_BUCKET_NAME, "string", `AWS_S3_BUCKET_NAME 가 선언되지 않았습니다.`);

const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: AWS_S3_BUCKET_NAME,
        key: (req: Request, file, cb) => {
            file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8");
            cb(null, req.query.room + "/" + file.originalname);
        },
    })
})

export default upload