import winston from "winston";
import assert from "assert";
import DailyRotateFile from 'winston-daily-rotate-file';

const format = winston.format;
const { combine, timestamp, colorize, printf } = winston.format;

const STORAGE_LOGDIR = process.env.STORAGE_LOGDIR as string;
assert.strictEqual(typeof STORAGE_LOGDIR, "string", "STORAGE_LOGDIR이 선언되지 않았습니다.");
const STORAGE_LOG_CONSOLE_LEVEL = process.env.GATEWAY_LOG_CONSOLE_LEVEL as string;
assert.strictEqual(typeof STORAGE_LOG_CONSOLE_LEVEL, "string", "STORAGE_LOG_CONSOLE_LEVEL 가 선언되지 않았습니다.");
const STORAGE_LOG_FILE_LEVEL = process.env.GATEWAY_LOG_FILE_LEVEL as string;
assert.strictEqual(typeof STORAGE_LOG_FILE_LEVEL, "string", "STORAGE_LOG_FILE_LEVEL 가 선언되지 않았습니다.");

const levelColors = {
    trace: 'grey',
    debug: 'cyan',
    info: 'green',
    warn: 'yellow',
    error: 'red',
}

const CustomLevel: winston.config.AbstractConfigSetLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4,
};

const logFormat = format.combine(
    colorize({ all: true, colors: levelColors }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSSS" }),
    printf(({ level: level, message: message, timestamp: timestamp }) => {                
        return `${timestamp} [${level}] ${message}`;
    })
);

const transport: DailyRotateFile = new DailyRotateFile({
    filename: '%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    dirname: STORAGE_LOGDIR,
    level: STORAGE_LOG_FILE_LEVEL,
    frequency: "1m",
    zippedArchive: true,
    maxSize: '20m',
});

interface CustomLogger extends winston.Logger {
    error: winston.LeveledLogMethod;
    warn: winston.LeveledLogMethod;
    info: winston.LeveledLogMethod;
    debug: winston.LeveledLogMethod;
    trace: winston.LeveledLogMethod;
}

const logger: CustomLogger = <CustomLogger>winston.createLogger({    
    levels: CustomLevel,        
    format: logFormat,
    transports: [
        transport,
        new winston.transports.Console({
            level: STORAGE_LOG_CONSOLE_LEVEL,
        }),
    ],
});

logger.trace("trace");
logger.debug("debug");
logger.info("info");
logger.warn("warn");
logger.error("error");
logger.info(`log path : ${STORAGE_LOGDIR}`);

export default logger;