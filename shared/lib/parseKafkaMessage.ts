import { AnyValidateFunction } from "ajv/dist/core";
import { KafkaMessage } from "kafkajs";

export default function parseKafkaMessage<T>(kafkaMessage: KafkaMessage, validate: AnyValidateFunction<T>): T {
    const kafkaMessageStr = kafkaMessage.value?.toString() ?? "";

    let kafkaMessageJson;
    try {
        kafkaMessageJson = JSON.parse(kafkaMessageStr);
    } catch (e) {
        if (e instanceof Error) {
            e.message += `\n${kafkaMessageStr}`;
            throw e;
        } else {
            throw new Error(`json parse error\n${kafkaMessageStr}`);
        }
    }

    const isValid = validate(kafkaMessageJson);

    if (isValid) {
        return kafkaMessageJson as T;
    } else {
        throw new Error(`kafka message is invalid in json schema\n${JSON.stringify({
            message: kafkaMessageJson,
            schema: validate.schema
        }, null, 4)}`);
    }
}