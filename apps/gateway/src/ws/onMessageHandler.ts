import WebSocket from "ws";
import { v4 as uuid } from "uuid";
import { kafkaProducer } from "@config/kafka";
import { ProducerRecord } from "kafkajs";
import logger from "@config/logger";
import IChangeText from "jcopy-shared/interface/kafka/IChangeText";

export default async function onMessageHandler(ws: WebSocket, clientId: string, message: WebSocket.RawData) {
    try {
        const jsonMessage = JSON.parse(message.toString());

        switch (jsonMessage.type) {
            case "text":
                const kafkaMsg: IChangeText = {
                    id: uuid(),
                    roomId: jsonMessage.roomId,
                    textId: jsonMessage.textId,
                    textValue: jsonMessage.textValue,
                    clientSession: clientId,
                };

                const kafkaRecord: ProducerRecord = {
                    topic: "change_text",
                    messages: [{ value: JSON.stringify(kafkaMsg) }]
                };

                logger.debug(`WebSocket on text message kafka producer new record\n${JSON.stringify(kafkaRecord, null, 4)}`);

                await kafkaProducer.send(kafkaRecord)
                    .then((d) => {
                        logger.info(`WebSocket on text message kafka producer success send\n${JSON.stringify(d, null, 4)}`);
                    })
                    .catch(e => {
                        throw new Error(`WebSocket on text message kafka producer fail send\n${JSON.stringify(e, null, 4)}`);
                    })
                
                break;
            case "file":
                /*
                TODO:
                file때 할 일
                */
                break;
        }

    } catch (e: unknown) {
        if (e instanceof Error) {
            logger.error(e.stack);
        } else {
            logger.error(`알 수 없는 에러 \n${e}`);
        }
    }
}
