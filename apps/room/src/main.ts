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
import {grpcServer} from "@config/grpc";
import * as grpc from "@grpc/grpc-js";
import { kafkaConsumer } from "@config/kafka";
import eachMessageHandler from "@kafka/eachMessageHandler";
import logger from "@config/logger";
import { createRoom, joinRoom, getLeftStorage, getJoinedClientIds } from "@grpc";
import { RoomService} from "shared/proto/jcopy_grpc_pb";

const GRPC_ROOM_PORT = process.env.GRPC_ROOM_PORT;

assert.strictEqual(typeof GRPC_ROOM_PORT, 'string', 'GRPC_ROOM_PORT 가 선언되지 않았습니다.');

kafkaConsumer.run({
    eachMessage: eachMessageHandler
});

grpcServer.addService(RoomService, { createRoom, joinRoom, getLeftStorage, getJoinedClientIds });

grpcServer.bindAsync(`0.0.0.0:${GRPC_ROOM_PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        logger.error(err);
    } else {
        grpcServer.start();
        logger.info(`gRPC server start :${port}`);
    }
})


