import { Kafka, logLevel } from "kafkajs";
import assert from "assert";
import WinstonLogCreator from "@config/logger/kafka_logger";
import logger from "@config/logger";
import { RetryOptions } from "kafkajs";

const KAFKA_BROKERS = process.env.KAFKA_BROKERS as string;
const GATEWAY_KAFKA_GROUP_ID = process.env.GATEWAY_KAFKA_GROUP_ID as string;
const topics = ["text_changed", "update_files"];

assert.strictEqual(typeof KAFKA_BROKERS, "string", `KAFKA_BROKERS 가 선언되지 않았습니다.`);
assert.strictEqual(typeof GATEWAY_KAFKA_GROUP_ID, "string", `GATEWAY_KAFKA_GROUP_ID 가 선언되지 않았습니다.`);

const kafka = new Kafka({
    brokers: KAFKA_BROKERS!.split(","),
    logCreator: WinstonLogCreator,
    logLevel: logLevel.DEBUG,
});

const kafkaProducer = kafka.producer();
const kafkaConsumer = kafka.consumer({ groupId: GATEWAY_KAFKA_GROUP_ID });

kafkaProducer.connect()
    .then(() => {
        logger.info('kafka producer init connect');
    })
    .catch(e => {
        logger.error(`kafka producer init connect error\n${e}`);
        assert.fail("kafka producer init connect error");
    })
kafkaConsumer.connect()
    .then(() => {
        logger.info('kafka consumer init connect');
    })
    .catch(e => {
        logger.error(`kafka consumer init connect error\n${e}`);
        assert.fail('kafka consumer init connect error');
    })
kafkaConsumer.subscribe({ topics: topics, fromBeginning: false })
    .then(() => {
        logger.info(`kafka consumer subscribe topics ${topics}`);
    })
    .catch(e => {        
        logger.error(`kafka consumer subscribe topic error\n${e}`);
        assert.fail('kafka consumer init connect error');
    })

kafkaProducer.on(kafkaProducer.events.CONNECT, e => {
    logger.info('kafka producer connect');    
});

kafkaProducer.on(kafkaProducer.events.DISCONNECT, e => {
    logger.error('kafka producer disconnect');    
});

kafkaConsumer.on(kafkaConsumer.events.CONNECT, e => {
    logger.info('kafka consumer connect');    
});

kafkaConsumer.on(kafkaConsumer.events.DISCONNECT, e => {
    logger.error('kafka consumer disconnect');
});

export { kafkaProducer, kafkaConsumer };

console.log(process.cwd());