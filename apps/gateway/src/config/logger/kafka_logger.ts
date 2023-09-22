import { logLevel } from 'kafkajs';
import winston, { Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import assert from "assert";
import path from "path";

const logDir = process.env.GATEWAY_LOGDIR as string;
assert.strictEqual(typeof logDir, "string", "GATEWAY_LOGDIR 가 선언되지 않았습니다.");

const toWinstonLogLevel = (level: logLevel): string => {
    switch (level) {
        case logLevel.ERROR:
        case logLevel.NOTHING:
            return 'error';
        case logLevel.WARN:
            return 'warn';
        case logLevel.INFO:
            return 'info';
        case logLevel.DEBUG:
            return 'debug';
        default:
            return 'info'; // Default to 'info' for unknown levels
    }
};


const levelColors = {    
    debug: 'cyan',
    info: 'green',
    warn: 'yellow',
    error: 'red',
}

const transport: DailyRotateFile = new DailyRotateFile({
    filename: '%DATE%.log',
    datePattern: 'YYYY-MM-DDTHH',
    dirname: path.resolve(logDir, "kafka"),    
    frequency: "1m",
    zippedArchive: true,
    maxSize: '20m',
    format: winston.format.colorize({all: true, colors: levelColors})
});

const WinstonLogCreator = (logLevel: logLevel): (({
    namespace,
    level,
    label,
    log,
}: {
    namespace: string;
    level: logLevel;
    label: string;
    log: { message: string;[key: string]: any };
}) => void) => {
    const logger: Logger = winston.createLogger({
        level: toWinstonLogLevel(logLevel),        
        transports: [
            transport
        ],
    });

    return ({ namespace, level, label, log }) => {
        const { message, ...extra } = log;
        logger.log({
            level: toWinstonLogLevel(level),            
            message,
            ...extra,
        });
    };
};

export default WinstonLogCreator;
