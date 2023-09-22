import { Kafka, logLevel } from "kafkajs";
import assert from "assert";
import WinstonLogCreator from "@config/logger/kafka_logger";
import logger from "@config/logger";

const KAFKA_BROKERS = process.env.KAFKA_BROKERS as string;
const STORAGE_KAFKA_GROUP_ID = process.env.STORAGE_KAFKA_GROUP_ID as string;
const topics = ["change_text"];

assert.strictEqual(typeof KAFKA_BROKERS, "string", `KAFKA_BROKERS 가 선언되지 않았습니다.`);
assert.strictEqual(typeof STORAGE_KAFKA_GROUP_ID, "string", `STORAGE_KAFKA_GROUP_ID 가 선언되지 않았습니다.`);

const kafka = new Kafka({
    brokers: KAFKA_BROKERS!.split(","),
    logCreator: WinstonLogCreator,
    logLevel: logLevel.DEBUG,
});

const kafkaProducer = kafka.producer();
const kafkaConsumer = kafka.consumer({ groupId: STORAGE_KAFKA_GROUP_ID });


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

let producerConnectCount = 0;
let producerDisconnectCount = 0;
let consumerConnectCount = 0;
let consumerDisconnectCount = 0;

kafkaProducer.on(kafkaProducer.events.CONNECT, (e) => {
    producerConnectCount++;
    if (producerConnectCount > 1){
        logger.info(`kafka producer connect ${producerConnectCount}`);    
    }    
});

kafkaProducer.on(kafkaProducer.events.DISCONNECT, e => {    
    producerDisconnectCount++;
    logger.error(`kafka producer disconnect ${producerDisconnectCount}`);    
});

kafkaConsumer.on(kafkaConsumer.events.CONNECT, e => {
    consumerConnectCount++;
    if (consumerConnectCount > 1){
        logger.info(`kafka consumer connect ${consumerConnectCount}`);    
    }
});

kafkaConsumer.on(kafkaConsumer.events.DISCONNECT, e => {  
    consumerDisconnectCount++; 
    logger.error(`kafka consumer disconnect ${consumerDisconnectCount}`);
});

export { kafkaProducer, kafkaConsumer };
