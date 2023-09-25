import { EachMessagePayload } from "kafkajs";
import {update_files, text_changed} from "./handler";

import logger from "@config/logger";

async function eachMessageHandler({ topic, partition, message }: EachMessagePayload) {
    try {
        logger.debug(`kafka consumer recv message [${topic}] ${message.value?.toString()}`);
        switch (topic) {
            case "text_changed":
                await text_changed(message);
                break;
            case "update_files":
                await update_files(message);
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