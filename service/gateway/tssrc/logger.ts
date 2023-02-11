import winston from "winston";
const format = winston.format;
import winstonDaily from "winston-daily-rotate-file";

const {combine, timestamp, label, printf} = winston.format;

let logDir = "";
let errDir = "";
let debugDir = "";
if (process.env.NODE_ENV == "develop") {
    logDir = `${process.cwd()}/logs/info`;
    errDir = `${process.cwd()}/logs/error`;
    debugDir = `${process.cwd()}/logs/debug`;
}
if (process.env.NODE_ENV == "production") {
    logDir = `/logs/info`;
    errDir = `/logs/error`;
    debugDir = `/logs/debug`;
}

const logFormat = printf(({level, message, label, timestamp}) => {
    return `${timestamp} [${level}] : ${message}`;
});

const logger = winston.createLogger({
    format: combine(
        timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
        label({label: "Gateway"}),
        logFormat
    ),
    transports: [
        new winstonDaily({
            level: "debug",
            datePattern: "YYYY-MM-DD",
            dirname: debugDir,
            filename: `%DATE%.gateway.debug.log`,
            maxFiles: 30,
            zippedArchive: true,
        }),

        new winstonDaily({
            level: "info",
            datePattern: "YYYY-MM-DD",
            dirname: logDir,
            filename: `%DATE%.gateway.log`,
            maxFiles: 30,
            zippedArchive: true,
        }),

        new winstonDaily({
            level: "error", // error 레벨에선
            datePattern: "YYYY-MM-DD",
            dirname: errDir, // /logs/error 하위에 저장
            filename: `%DATE%.gateway.error.log`, // 에러 로그는 2020-05-28.error.log 형식으로 저장
            maxFiles: 30,
            zippedArchive: true,
        }),
    ],
});

logger.add(
    new winston.transports.Console({
        level: "debug",
        format: format.combine(
            format.label({label: "Gateway"}),
            format.timestamp({
                format: "YYYY-MM-DD HH:mm:ss",
            }),
            format.colorize(),
            logFormat
        ),
    })
);

export default logger;
