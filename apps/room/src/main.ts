import dotenv from "dotenv";
dotenv.config();

import assert from "assert";
import {grpcServer} from "@config/grpc";
import {ServerCredentials} from "@grpc/grpc-js";
import { kafkaConsumer } from "@config/kafka";
import eachMessageHandler from "@kafka/eachMessageHandler";
import logger from "@config/logger";

const GRPC_ROOM_PORT = process.env.GRPC_ROOM_PORT;
assert.strictEqual(typeof GRPC_ROOM_PORT, 'string', 'GRPC_ROOM_PORT 가 선언되지 않았습니다.');


(async () => {
    await kafkaConsumer.run({
        eachMessage: eachMessageHandler
    })
})();

grpcServer.bindAsync(`0.0.0.0:${GRPC_ROOM_PORT}`, ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        logger.error(err);
    } else {
        grpcServer.start();
        logger.info(`gRPC server start :${port}`);
    }
})


