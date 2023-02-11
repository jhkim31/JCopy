"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = __importDefault(require("winston"));
var format = winston_1.default.format;
var winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
var _a = winston_1.default.format, combine = _a.combine, timestamp = _a.timestamp, label = _a.label, printf = _a.printf;
var logDir = "";
var errDir = "";
var debugDir = "";
if (process.env.NODE_ENV == "develop") {
    logDir = "".concat(process.cwd(), "/logs/info");
    errDir = "".concat(process.cwd(), "/logs/error");
    debugDir = "".concat(process.cwd(), "/logs/debug");
}
if (process.env.NODE_ENV == "production") {
    logDir = "/logs/info";
    errDir = "/logs/error";
    debugDir = "/logs/debug";
}
var logFormat = printf(function (_a) {
    var level = _a.level, message = _a.message, label = _a.label, timestamp = _a.timestamp;
    return "".concat(timestamp, " [").concat(level, "] : ").concat(message);
});
var logger = winston_1.default.createLogger({
    format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), label({ label: "Gateway" }), logFormat),
    transports: [
        new winston_daily_rotate_file_1.default({
            level: "debug",
            datePattern: "YYYY-MM-DD",
            dirname: debugDir,
            filename: "%DATE%.gateway.debug.log",
            maxFiles: 30,
            zippedArchive: true,
        }),
        new winston_daily_rotate_file_1.default({
            level: "info",
            datePattern: "YYYY-MM-DD",
            dirname: logDir,
            filename: "%DATE%.gateway.log",
            maxFiles: 30,
            zippedArchive: true,
        }),
        new winston_daily_rotate_file_1.default({
            level: "error",
            datePattern: "YYYY-MM-DD",
            dirname: errDir,
            filename: "%DATE%.gateway.error.log",
            maxFiles: 30,
            zippedArchive: true,
        }),
    ],
});
logger.add(new winston_1.default.transports.Console({
    level: "debug",
    format: format.combine(format.label({ label: "Gateway" }), format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }), format.colorize(), logFormat),
}));
exports.default = logger;
