import express, {Request, Response} from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import path from "path";
import connectRedis from "connect-redis";
import redisClient from "@config/redis";
import assert from "assert";
import logger from "@config/logger";

const EXPRESS_SESSION_SECRET = process.env.EXPRESS_SESSION_SECRET as string;
const EXPRESS_SESSION_COOKIE_MAXAGE = process.env.EXPRESS_SESSION_COOKIE_MAXAGE as string;

assert.strictEqual(typeof EXPRESS_SESSION_SECRET, "string", `EXPRESS_SESSION_SECRET 가 선언되지 않았습니다.`);
assert.strictEqual(typeof EXPRESS_SESSION_COOKIE_MAXAGE, "string", `EXPRESS_SESSION_COOKIE_MAXAGE 가 선언되지 않았습니다.`);

const cookie_maxage = parseInt(EXPRESS_SESSION_COOKIE_MAXAGE);
assert.strictEqual(isNaN(cookie_maxage), false, `EXPRESS_SESSION_COOKIE_MAXAGE 가 Integer값이 아닙니다.`);

const staticPath = (relative_path: string) => path.resolve(process.cwd(), relative_path);
const RedisStore = connectRedis(session);
const Express = express();

Express.use(cors());
Express.use(cookieParser());
Express.use(express.json());
Express.use(express.urlencoded({ extended: true }));
Express.use(express.static(staticPath("./build")));

Express.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: cookie_maxage
    }
}));

export default Express;