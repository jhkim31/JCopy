import { createClient } from "redis";
import * as assert from "assert";

const REDIS_HOST = process.env.REDIS_HOST as string;
const REDIS_PORT = process.env.REDIS_PORT as string;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD as string;

assert.strictEqual(typeof REDIS_HOST, "string", `REDIS_HOST 가 선언되지 않았습니다.`);
assert.strictEqual(typeof REDIS_PORT, "string", `REDIS_PORT 가 선언되지 않았습니다.`);
assert.strictEqual(typeof REDIS_PASSWORD, "string", `REDIS_PASSWORD 가 선언되지 않았습니다.`);

const url = `redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`;
const redisClient = createClient({ url });
redisClient.connect();

export default redisClient;
