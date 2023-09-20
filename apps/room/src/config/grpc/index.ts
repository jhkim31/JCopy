import * as grpc from "@grpc/grpc-js";
import assert from "assert";

import { RoomService, StorageClient } from "jcopy-shared/proto/jcopy_grpc_pb";
import {credentials} from "jcopy-shared/node_modules/@grpc/grpc-js";
import { createRoom, joinRoom, getLeftStorage, getJoinedSessions } from "@grpc";

const GRPC_STORAGE_HOST = process.env.GRPC_STORAGE_HOST;
const GRPC_STORAGE_PORT = process.env.GRPC_STORAGE_PORT;

assert.strictEqual(typeof GRPC_STORAGE_HOST, "string", `GRPC_STORAGE_HOST 가 선언되지 않았습니다.`);
assert.strictEqual(typeof GRPC_STORAGE_PORT, "string", `GRPC_STORAGE_PORT 가 선언되지 않았습니다.`);

const options = {
    keepCase: true,
    longs: Number,
    defaults: true,
    oneofs: true,
};

const grpcServer = new grpc.Server(options);
const grpcStorageClient = new StorageClient(`${GRPC_STORAGE_HOST}:${GRPC_STORAGE_PORT}`, credentials.createInsecure());

grpcServer.addService(RoomService, { createRoom, joinRoom, getLeftStorage, getJoinedSessions });

export {grpcServer, grpcStorageClient};