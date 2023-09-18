import { KafkaMessage } from "kafkajs";
import ajv from "@config/ajv";
import IChangeText from "@shared/interface/kafka/IChangeText";
import parseKafkaMessage from "@shared/lib/parseKafkaMessage";
import redisClient from "@config/redis";
import ITextChanged from "@shared/interface/kafka/ITextChanged";
import { kafkaProducer } from "@config/kafka";

export default async function change_text(message: KafkaMessage) {
    const validate = ajv.getSchema<IChangeText>("kafka.ChangeText");

    if (validate == undefined) {
        throw new Error("validate Error");
    }

    const changeTextJsonMessage = parseKafkaMessage<IChangeText>(message, validate);

    const redisResult = await redisClient
        .set(changeTextJsonMessage.textId, changeTextJsonMessage.textValue, { KEEPTTL: true })
        .catch(e => {
            console.error(e);
        });

    if (typeof redisResult != "string") {
        throw new Error("kafka change_text Error");
    }

    const textChangedKafkaMessage: ITextChanged = {
        roomId: changeTextJsonMessage.roomId,
        textId: changeTextJsonMessage.textId,
        textValue: changeTextJsonMessage.textValue,
        clientSession: changeTextJsonMessage.clientSession
    }

    const kafkaRecord = {
        topic: "text_changed",
        messages: [{ value: JSON.stringify(textChangedKafkaMessage) }]
    }

    const kafkaResult = await kafkaProducer
        .send(kafkaRecord)       
       .then(d => {
        console.log(d);
       })
       .catch(e => {
        console.log(e);
       })
    

}