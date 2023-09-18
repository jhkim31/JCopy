import { EachMessagePayload } from "kafkajs";
import change_text from "./handler/change_text";

async function eachMessageHandler({ topic, partition, message }: EachMessagePayload) {
    try {
        switch (topic) {
            case "change_text":
                change_text(message);
                break;
            default:
                break;
        }
    } catch (e: unknown) {

    }
}

export default eachMessageHandler;