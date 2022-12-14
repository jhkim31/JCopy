/*
https://inpa.tistory.com/entry/NODE-๐-Winston-๋ชจ๋-์ฌ์ฉ๋ฒ-์๋ฒ-๋ก๊ทธ-๊ด๋ฆฌ
๋ก๊ทธ ๊ด๋ฆฌ
*/
const winston = require("winston");
const format = winston.format;
const winstonDaily = require("winston-daily-rotate-file");

const {combine, timestamp, label, printf} = winston.format;

//* ๋ก๊ทธ ํ์ผ ์ ์ฅ ๊ฒฝ๋ก โ ๋ฃจํธ ๊ฒฝ๋ก/logs ํด๋
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

//* log ์ถ๋ ฅ ํฌ๋งท ์ ์ ํจ์
const logFormat = printf(({level, message, label, timestamp}) => {
    return `${timestamp} [${level}] : ${message}`; // ๋ ์ง [์์คํ์ด๋ฆ] ๋ก๊ทธ๋ ๋ฒจ ๋ฉ์ธ์ง
});
/*
new winstonDaily({

frequency: ํ์  ๋น๋๋ฅผ ๋ํ๋ด๋ ๋ฌธ์์ด์๋๋ค. ์ด๋ ํน์  ์๊ฐ์ ๋ฐ์ํ๋ ํ์ ๊ณผ ๋ฌ๋ฆฌ ์๊ฐ์ด ์ง์ ๋ ํ์ ์ ์ํ๋ ๊ฒฝ์ฐ์ ์ ์ฉํฉ๋๋ค. ์ ํจํ ๊ฐ์ '#m' ๋๋ '#h'(์: '5m' ๋๋ '3h')์๋๋ค. ์ด null์ ๋จ๊ฒจ๋๋ datePattern๊ฒ์ ํ์  ์๊ฐ ์ ์์กดํฉ๋๋ค . (๊ธฐ๋ณธ๊ฐ: null)

datePattern: ํ์ ์ ์ฌ์ฉํ  moment.js ๋ ์ง ํ์ ์ ๋ํ๋ด๋ ๋ฌธ์์ด ์๋๋ค. ์ด ๋ฌธ์์ด์ ์ฌ์ฉ๋ ๋ฉํ ๋ฌธ์๋ ํ์ผ ํ์  ๋น๋๋ฅผ ๋ํ๋๋๋ค. ์๋ฅผ ๋ค์ด, datePattern์ด ๋จ์ํ 'HH'์ธ ๊ฒฝ์ฐ ๋งค์ผ ์ ํํ์ฌ ์ถ๊ฐ๋๋ 24๊ฐ์ ๋ก๊ทธ ํ์ผ๋ก ๋๋ฉ๋๋ค. (๊ธฐ๋ณธ๊ฐ: 'YYYY-MM-DD')

zippedArchive: ์์นด์ด๋ธ๋ ๋ก๊ทธ ํ์ผ์ gzip์ผ๋ก ์์ถํ ์ง ์ฌ๋ถ๋ฅผ ์ ์ํ๋ ๋ถ์ธ์๋๋ค. (๊ธฐ๋ณธ๊ฐ: '๊ฑฐ์ง')

filename: ๋ก๊ทธ์ ์ฌ์ฉํ  ํ์ผ ์ด๋ฆ์๋๋ค. ์ด ํ์ผ ์ด๋ฆ์ ํ์ผ ์ด๋ฆ์ %DATE%ํด๋น ์ง์ ์ ์์์ด ์ง์ ๋ datePattern์ ํฌํจํ๋ ์๋ฆฌ ํ์์๋ฅผ ํฌํจํ  ์ ์์ต๋๋ค . (๊ธฐ๋ณธ๊ฐ: 'winston.log.%DATE%')

dirname: ๋ก๊ทธ ํ์ผ์ ์ ์ฅํ  ๋๋ ํฐ๋ฆฌ ์ด๋ฆ์๋๋ค. (๊ธฐ๋ณธ: '.')

stream: ์ฌ์ฉ์ ์ง์  ์คํธ๋ฆผ์ ์ง์  ์ฐ๊ณ  ํ์  ๊ธฐ๋ฅ์ ์ฐํํฉ๋๋ค. (๊ธฐ๋ณธ๊ฐ: null)

maxSize: ํ์ ํ  ํ์ผ์ ์ต๋ ํฌ๊ธฐ์๋๋ค. ๋ฐ์ดํธ ์ ๋๋ kb, mb ๋ฐ GB ๋จ์๊ฐ ๋  ์ ์์ต๋๋ค. ๋จ์๋ฅผ ์ฌ์ฉํ๋ ๊ฒฝ์ฐ ์ ๋ฏธ์ฌ๋ก 'k', 'm' ๋๋ 'g'๋ฅผ ์ถ๊ฐํฉ๋๋ค. ๋จ์๋ ์ซ์๋ฅผ ์ง์  ๋ฐ๋ผ์ผ ํฉ๋๋ค. (๊ธฐ๋ณธ๊ฐ: null)

maxFiles: ๋ณด๊ดํ  ์ต๋ ๋ก๊ทธ ์์๋๋ค. ์ค์ ํ์ง ์์ผ๋ฉด ๋ก๊ทธ๊ฐ ์ ๊ฑฐ๋์ง ์์ต๋๋ค. ์ด๋ ํ์ผ ์ ๋๋ ์ผ ์์ผ ์ ์์ต๋๋ค. ์ผ์ ์ฌ์ฉํ๋ ๊ฒฝ์ฐ ์ ๋ฏธ์ฌ๋ก 'd'๋ฅผ ์ถ๊ฐํฉ๋๋ค. (๊ธฐ๋ณธ๊ฐ: null)

options: ํ์ผ ์คํธ๋ฆผ์ ์ ๋ฌ๋์ด์ผ ํ๋ ์ถ๊ฐ ์ต์์ ๋ํ๋ด๋ 'https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options' ์ ์ ์ฌํ ๊ฐ์ฒด . (๊ธฐ๋ณธ๊ฐ: { flags: 'a' })

auditFile : ๊ฐ์ฌ ํ์ผ์ ์ด๋ฆ์ ๋ํ๋ด๋ ๋ฌธ์์ด. ์ต์ ๊ฐ์ฒด์ ํด์๋ฅผ ๊ณ์ฐํ์ฌ ์์ฑ๋ ๊ธฐ๋ณธ ํ์ผ ์ด๋ฆ์ ์ฌ์ ์ํ๋ ๋ฐ ์ฌ์ฉํ  ์ ์์ต๋๋ค. (๊ธฐ๋ณธ๊ฐ: '..json')

utc : ํ์ผ ์ด๋ฆ์ ๋ ์ง์ UTC ์๊ฐ์ ์ฌ์ฉํฉ๋๋ค. (๊ธฐ๋ณธ๊ฐ: ๊ฑฐ์ง)

extension : ํ์ผ ์ด๋ฆ์ ์ถ๊ฐํ  ํ์ผ ํ์ฅ์. (๊ธฐ๋ณธ: '')

createSymlink : ํ์ฌ ํ์ฑ ๋ก๊ทธ ํ์ผ์ ๋ํ tailable symlink๋ฅผ ๋ง๋ญ๋๋ค. (๊ธฐ๋ณธ๊ฐ: ๊ฑฐ์ง)

symlinkName : tailable symlink์ ์ด๋ฆ์๋๋ค. (๊ธฐ๋ณธ๊ฐ: 'current.log')
*/
const logger = winston.createLogger({
    //* ๋ก๊ทธ ์ถ๋ ฅ ํ์ ์ ์
    format: combine(
        timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
        label({label: "Gateway"}), // ์ดํ๋ฆฌ์ผ์ด์ ์ด๋ฆ
        logFormat // log ์ถ๋ ฅ ํฌ๋งท
        //? format: combine() ์์ ์ ์ํ timestamp์ label ํ์๊ฐ์ด logFormat์ ๋ค์ด๊ฐ์ ์ ์๋๊ฒ ๋๋ค. level์ด๋ message๋ ์ฝ์์์ ์๋ ์ ์
    ),
    transports: [
        new winstonDaily({
            level: "debug", // error ๋ ๋ฒจ์์ 
            datePattern: "YYYY-MM-DD",
            dirname: debugDir, // /logs/error ํ์์ ์ ์ฅ
            filename: `%DATE%.gateway.debug.log`, // ์๋ฌ ๋ก๊ทธ๋ 2020-05-28.error.log ํ์์ผ๋ก ์ ์ฅ
            maxFiles: 30,
            zippedArchive: true,
        }),

        new winstonDaily({
            level: "info", // info ๋ ๋ฒจ์์ 
            datePattern: "YYYY-MM-DD", // ํ์ผ ๋ ์ง ํ์
            dirname: logDir, // ํ์ผ ๊ฒฝ๋ก
            filename: `%DATE%.gateway.log`, // ํ์ผ ์ด๋ฆ
            maxFiles: 30, // ์ต๊ทผ 30์ผ์น ๋ก๊ทธ ํ์ผ์ ๋จ๊น
            zippedArchive: true, // ์์นด์ด๋ธ๋ ๋ก๊ทธ ํ์ผ์ gzip์ผ๋ก ์์ถํ ์ง ์ฌ๋ถ
        }),

        new winstonDaily({
            level: "error", // error ๋ ๋ฒจ์์ 
            datePattern: "YYYY-MM-DD",
            dirname: errDir, // /logs/error ํ์์ ์ ์ฅ
            filename: `%DATE%.gateway.error.log`, // ์๋ฌ ๋ก๊ทธ๋ 2020-05-28.error.log ํ์์ผ๋ก ์ ์ฅ
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

module.exports = logger;
