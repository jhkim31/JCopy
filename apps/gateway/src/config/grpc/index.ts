import assert from "assert";

import { RoomClient, StorageClient } from "jcopy-shared/proto/jcopy_grpc_pb";
import {credentials} from "jcopy-shared/node_modules/@grpc/grpc-js";


const GRPC_STORAGE_HOST = process.env.GRPC_STORAGE_HOST;
const GRPC_STORAGE_PORT = process.env.GRPC_STORAGE_PORT;
const GRPC_ROOM_HOST = process.env.GRPC_ROOM_HOST;
const GRPC_ROOM_PORT = process.env.GRPC_ROOM_PORT;

assert.strictEqual(typeof GRPC_STORAGE_HOST, "string", `GRPC_STORAGE_HOST 가 선언되지 않았습니다.`);
assert.strictEqual(typeof GRPC_STORAGE_PORT, "string", `GRPC_STORAGE_PORT 가 선언되지 않았습니다.`);
assert.strictEqual(typeof GRPC_ROOM_HOST, "string", `GRPC_ROOM_HOST 가 선언되지 않았습니다.`);
assert.strictEqual(typeof GRPC_ROOM_PORT, "string", `GRPC_ROOM_PORT 가 선언되지 않았습니다.`);

const options = {
    keepCase: true,
    longs: Number,
    defaults: true,
    oneofs: true,
};

const grpcRoomClient = new RoomClient(`${GRPC_ROOM_HOST}:${GRPC_ROOM_PORT}`, credentials.createInsecure());
const grpcStorageClient = new StorageClient(`${GRPC_STORAGE_HOST}:${GRPC_STORAGE_PORT}`, credentials.createInsecure());

export { grpcRoomClient, grpcStorageClient};