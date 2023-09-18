import { Kafka, logLevel } from "kafkajs";
import * as assert from "assert";

const KAFKA_BROKERS = process.env.KAFKA_BROKERS as string;
const STORAGE_KAFKA_GROUP_ID = process.env.STORAGE_KAFKA_GROUP_ID as string;

assert.strictEqual(typeof KAFKA_BROKERS, "string", `KAFKA_BROKERS 가 선언되지 않았습니다.`);
assert.strictEqual(typeof STORAGE_KAFKA_GROUP_ID, "string", `STORAGE_KAFKA_GROUP_ID 가 선언되지 않았습니다.`);
console.log(KAFKA_BROKERS!.split(","));
const kafka = new Kafka({
    brokers: KAFKA_BROKERS!.split(","),
    logLevel: logLevel.DEBUG,
});

const kafkaProducer = kafka.producer();
const kafkaConsumer = kafka.consumer({ groupId: STORAGE_KAFKA_GROUP_ID });

kafkaProducer.connect();
kafkaConsumer.connect();
kafkaConsumer.subscribe({topics: ["change_text"], fromBeginning: false});

export { kafkaProducer, kafkaConsumer };
