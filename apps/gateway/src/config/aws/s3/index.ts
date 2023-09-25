import * as AWS from "@aws-sdk/client-s3";
import assert from "assert";

const AWS_REGION = process.env.AWS_REGION as string;

assert.strictEqual(typeof AWS_REGION, "string", "AWS_REGION 가 선언되지 않았습니다.");

const s3Client = new AWS.S3Client({ region: AWS_REGION });

export default s3Client;