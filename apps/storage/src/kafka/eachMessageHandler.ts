import { EachMessagePayload } from "kafkajs";
import change_text from "./handler/change_text";
import logger from "@config/logger";

async function eachMessageHandler({ topic, partition, message }: EachMessagePayload) {
    try {
        logger.debug(`kafka consumer recv message [${topic}] ${message.value?.toString()}`);
        switch (topic) {
            case "change_text":
                await change_text(message);
                break;
            default:
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

export default eachMessageHandler;