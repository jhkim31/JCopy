import dotenv from "dotenv";
dotenv.config({path: "./shared/.env"});
import grpcServer from "src/config/grpc";
import * as grpc from "@grpc/grpc-js";
import * as assert from "assert";
import { kafkaConsumer } from "@config/kafka";
import eachMessageHandler from "src/kafka/eachMessageHandler";

const STORAGE_PORT = process.env.STORAGE_PORT;
assert.strictEqual(typeof STORAGE_PORT, 'string', 'STORAGE_PORT 가 선언되지 않았습니다.');


(async () => {    
    await kafkaConsumer.run({
        eachMessage: eachMessageHandler
    })
})();

grpcServer.bindAsync(`0.0.0.0:${STORAGE_PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error(err);
    } else {
        grpcServer.start();
        console.log(`gRPC Server :${port}`);
    }
})


