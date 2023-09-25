import assert from "assert";
import mongoose from "mongoose";
import logger from "@config/logger";

const MONGODB_USER = process.env.MONGODB_USER as string;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD as string;
const MONGODB_HOST = process.env.MONGODB_HOST as string;
const MONGODB_PORT = process.env.MONGODB_PORT as string;
const MONGODB_DBNAME = process.env.MONGODB_DBNAME as string;

assert.strictEqual(typeof MONGODB_USER, "string", `MONGODB_USER 가 선언되지 않았습니다.`);
assert.strictEqual(typeof MONGODB_PASSWORD, "string", `MONGODB_PASSWORD 가 선언되지 않았습니다.`);
assert.strictEqual(typeof MONGODB_HOST, "string", `MONGODB_HOST 가 선언되지 않았습니다.`);
assert.strictEqual(typeof MONGODB_PORT, "string", `MONGODB_PORT 가 선언되지 않았습니다.`);
assert.strictEqual(typeof MONGODB_DBNAME, "string", `MONGODB_DB4 가 선언되지 않았습니다.`);

const url = `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}`;

mongoose.set("strictQuery", true);
mongoose
    .connect(url, { dbName: MONGODB_DBNAME })
    .then(() => {
        logger.info('mongodb init connect');
    })
    .catch(e => {
        logger.error(`mongodb init connect error\n${e}`);
        assert.fail("mongodb init connect error");
    });

const RoomSchema = new mongoose.Schema({
    roomId: {type: String, required: true},
    clientIds: {type: [String], required: true},
    textId: {type: String, required: true},
    leftStorage: {type: Number, required: true},
    fileIds: {type: [String], required: true},
    expireAt: { type: Date, expires: 100 , required: true,},
    expireTime: {type: Date, required: true}
});

const Room = mongoose.model("Room", RoomSchema);

export default mongoose;
export {Room};