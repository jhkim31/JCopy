import { KafkaMessage } from "kafkajs";
import ajv from "@config/ajv";
import IChangeText from "shared/interface/kafka/IChangeText";
import parseKafkaMessage from "shared/lib/parseKafkaMessage";
import redisClient from "@config/redis";
import ITextChanged from "shared/interface/kafka/ITextChanged";
import { kafkaProducer } from "@config/kafka";
import logger from "@config/logger";

export default async function change_text(message: KafkaMessage) {
    const ajvSchemaKey = "kafka.ChangeText";
    const validate = ajv.getSchema<IChangeText>(ajvSchemaKey);

    if (validate == undefined) {
        throw new Error(`ajv get schema error : ${ajvSchemaKey}`);
    }

    const changeTextJsonMessage = parseKafkaMessage<IChangeText>(message, validate);

    await redisClient
        .set(changeTextJsonMessage.textId, changeTextJsonMessage.textValue, { KEEPTTL: true })
        .then(d => {
            if (d == "OK") {
                logger.info(`kafka change_text sucess set redis\n${JSON.stringify(changeTextJsonMessage, null, 4)}`);
            } else {
                throw new Error(`kafka change_text redis error\n${JSON.stringify(changeTextJsonMessage, null, 4)}`);
            }
        })
        .catch(e => {
            if (e instanceof Error) {
                new Error(`${e.message}\n${JSON.stringify(changeTextJsonMessage, null, 4)}`);
            } else {
                throw new Error(`kafka change_text redis error\n${JSON.stringify(changeTextJsonMessage, null, 4)}`);
            }
        });


    const textChangedKafkaMessage: ITextChanged = {
        roomId: changeTextJsonMessage.roomId,
        textId: changeTextJsonMessage.textId,
        textValue: changeTextJsonMessage.textValue,
        clientId: changeTextJsonMessage.clientId
    }

    const kafkaRecord = {
        topic: "text_changed",
        messages: [{ value: JSON.stringify(textChangedKafkaMessage) }]
    }

    logger.debug(`kafka producer new record\n${JSON.stringify(kafkaRecord, null, 4)}`);

    await kafkaProducer
        .send(kafkaRecord)
        .then(d => {
            logger.debug(`kafka producer success send\n${JSON.stringify(d, null, 4)}`);
        })
        .catch(e => {
            logger.error(`kafka producer fail send\n${JSON.stringify(e, null, 4)}`);
        })
}