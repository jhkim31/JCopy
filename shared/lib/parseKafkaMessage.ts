import { AnyValidateFunction } from "ajv/dist/core";
import { KafkaMessage } from "kafkajs";

export default function parseKafkaMessage<T>(kafkaMessage: KafkaMessage, validate: AnyValidateFunction<T>): T {
    const kafkaMessageStr = kafkaMessage.value?.toString() ?? "";
    const kafkaMessageJson = JSON.parse(kafkaMessageStr);

    const isValid = validate(kafkaMessageJson);

    if (isValid){
        return kafkaMessageJson as T;
    } else {
        throw new Error("Kafka Message Schema Error");
    }


}