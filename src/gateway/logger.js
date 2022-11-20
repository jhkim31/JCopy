/*
https://inpa.tistory.com/entry/NODE-📚-Winston-모듈-사용법-서버-로그-관리
로그 관리
*/
const winston = require("winston");
const format = winston.format;
const winstonDaily = require("winston-daily-rotate-file");

const {combine, timestamp, label, printf} = winston.format;

//* 로그 파일 저장 경로 → 루트 경로/logs 폴더
let logDir = '';
let errDir = ''
if (process.env.NODE_ENV == 'develop'){
    logDir = `${process.cwd()}/logs/info`;
    errDir = `${process.cwd()}/logs/error`;
}
if (process.env.NODE_ENV == 'production'){
    logDir = `/logs/info`;
    errDir = `/logs/error`;
}


//* log 출력 포맷 정의 함수
const logFormat = printf(({level, message, label, timestamp}) => {
    return `${timestamp} [${level}] ${label} : ${message}`; // 날짜 [시스템이름] 로그레벨 메세지
});
/*
new winstonDaily({

frequency: 회전 빈도를 나타내는 문자열입니다. 이는 특정 시간에 발생하는 회전과 달리 시간이 지정된 회전을 원하는 경우에 유용합니다. 유효한 값은 '#m' 또는 '#h'(예: '5m' 또는 '3h')입니다. 이 null을 남겨두는 datePattern것은 회전 시간 에 의존합니다 . (기본값: null)

datePattern: 회전에 사용할 moment.js 날짜 형식 을 나타내는 문자열 입니다. 이 문자열에 사용된 메타 문자는 파일 회전 빈도를 나타냅니다. 예를 들어, datePattern이 단순히 'HH'인 경우 매일 선택하여 추가되는 24개의 로그 파일로 끝납니다. (기본값: 'YYYY-MM-DD')

zippedArchive: 아카이브된 로그 파일을 gzip으로 압축할지 여부를 정의하는 부울입니다. (기본값: '거짓')

filename: 로그에 사용할 파일 이름입니다. 이 파일 이름은 파일 이름의 %DATE%해당 지점에 서식이 지정된 datePattern을 포함하는 자리 표시자를 포함할 수 있습니다 . (기본값: 'winston.log.%DATE%')

dirname: 로그 파일을 저장할 디렉터리 이름입니다. (기본: '.')

stream: 사용자 지정 스트림에 직접 쓰고 회전 기능을 우회합니다. (기본값: null)

maxSize: 회전할 파일의 최대 크기입니다. 바이트 수 또는 kb, mb 및 GB 단위가 될 수 있습니다. 단위를 사용하는 경우 접미사로 'k', 'm' 또는 'g'를 추가합니다. 단위는 숫자를 직접 따라야 합니다. (기본값: null)

maxFiles: 보관할 최대 로그 수입니다. 설정하지 않으면 로그가 제거되지 않습니다. 이는 파일 수 또는 일 수일 수 있습니다. 일을 사용하는 경우 접미사로 'd'를 추가합니다. (기본값: null)

options: 파일 스트림에 전달되어야 하는 추가 옵션을 나타내는 'https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options' 와 유사한 객체 . (기본값: { flags: 'a' })

auditFile : 감사 파일의 이름을 나타내는 문자열. 옵션 개체의 해시를 계산하여 생성된 기본 파일 이름을 재정의하는 데 사용할 수 있습니다. (기본값: '..json')

utc : 파일 이름의 날짜에 UTC 시간을 사용합니다. (기본값: 거짓)

extension : 파일 이름에 추가할 파일 확장자. (기본: '')

createSymlink : 현재 활성 로그 파일에 대한 tailable symlink를 만듭니다. (기본값: 거짓)

symlinkName : tailable symlink의 이름입니다. (기본값: 'current.log')
*/
const logger = winston.createLogger({
    //* 로그 출력 형식 정의
    format: combine(
        timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
        label({label: "Gateway"}), // 어플리케이션 이름
        logFormat // log 출력 포맷
        //? format: combine() 에서 정의한 timestamp와 label 형식값이 logFormat에 들어가서 정의되게 된다. level이나 message는 콘솔에서 자동 정의
    ),
    transports: [
        //* info 레벨 로그를 저장할 파일 설정 (info: 2 보다 높은 error: 0 와 warn: 1 로그들도 자동 포함해서 저장)
        new winstonDaily({
            level: "info", // info 레벨에선
            datePattern: "YYYY-MM-DD", // 파일 날짜 형식
            dirname: logDir, // 파일 경로
            filename: `%DATE%.log`, // 파일 이름
            maxFiles: 30, // 최근 30일치 로그 파일을 남김
            zippedArchive: true, // 아카이브된 로그 파일을 gzip으로 압축할지 여부
        }),
        //* error 레벨 로그를 저장할 파일 설정 (info에 자동 포함되지만 일부러 따로 빼서 설정)
        new winstonDaily({
            level: "error", // error 레벨에선
            datePattern: "YYYY-MM-DD",
            dirname: errDir, // /logs/error 하위에 저장
            filename: `%DATE%.error.log`, // 에러 로그는 2020-05-28.error.log 형식으로 저장
            maxFiles: 30,
            zippedArchive: true,
        }),
    ],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            level: "info",
            format: format.combine(
                format.label({label: "gateway"}),
                format.timestamp({
                    format: "YYYY-MM-DD HH:mm:ss",
                }),
                format.colorize(),
                logFormat,
            ),
        })
    );
}

module.exports = logger;
