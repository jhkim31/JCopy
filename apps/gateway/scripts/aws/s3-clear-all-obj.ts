import * as aws from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new aws.S3Client({ region: "ap-northeast-2" });

const params = {
    Bucket: "jcopy-bucket",
}

const lcommand = new aws.ListObjectsCommand(params);
s3Client.send(lcommand)
    .then(d => {
        console.log("current");
        console.log(d.Contents);

        const objects = [];

        if (d.Contents != undefined) {
            for (const content of d.Contents) {
                objects.push({ Key: content.Key });
            }
            const params2: aws.DeleteObjectsRequest = {
                Bucket: "jcopy-bucket",
                Delete: {
                    Objects: objects
                }
            }
            const dcommand = new aws.DeleteObjectsCommand(params2);

            console.log('delete');
            s3Client.send(dcommand)
                .then(d => {
                    console.log(d);
                })
                .catch(e => {
                    console.error(e);
                })
        }
    })
    .catch(e => {
        console.error(e);
    })