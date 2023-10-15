import staticPath from "shared/lib/staticPath"
import dotenv from "dotenv";
if (process.env.NODE_ENV == "production") {
    dotenv.config();
} else if (process.env.NODE_ENV == "development") {
    dotenv.config({path: staticPath("../../.env")});
} else {
    dotenv.config();
}

import assert from "assert";
import * as grpc from "@grpc/grpc-js";

import grpcServer from "@config/grpc";
import { kafkaConsumer } from "@config/kafka";
import eachMessageHandler from "@kafka/eachMessageHandler";
import logger from "@config/logger";
import { createText, getFiles, getText } from "@grpc";
import { StorageService } from "shared/proto/jcopy_grpc_pb";

const GRPC_STORAGE_PORT = process.env.GRPC_STORAGE_PORT;

assert.strictEqual(typeof GRPC_STORAGE_PORT, 'string', 'STORAGE_PORT 가 선언되지 않았습니다.');

kafkaConsumer.run({
    eachMessage: eachMessageHandler
})

grpcServer.addService(StorageService, { createText, getFiles, getText });

grpcServer.bindAsync(`0.0.0.0:${GRPC_STORAGE_PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {        
        logger.error(err);
    } else {
        grpcServer.start();
        logger.info(`gRPC server start :${port}`);
    }
})


