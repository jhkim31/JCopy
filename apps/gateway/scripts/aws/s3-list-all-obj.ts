import * as aws from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new aws.S3Client({ region: "ap-northeast-2" });

const params = {
    Bucket: "jcopy-bucket",
}

const lcommand: aws.ListObjectsCommand = new aws.ListObjectsCommand(params);
s3Client.send(lcommand)
    .then(d => {
        console.log("current");
        console.log(d.Contents);        
    })
    .catch(e => {
        console.error(e);
    })