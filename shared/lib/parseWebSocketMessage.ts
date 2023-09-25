import { AnyValidateFunction } from "ajv/dist/core";

export default function parseWebSocketMessage<T>(wsMessage: string, validate: AnyValidateFunction<T>): T {    
    
    let wsMessageJson;
    try {
        wsMessageJson = JSON.parse(wsMessage);
    } catch (e) {
        if (e instanceof Error) {
            e.message += `\n${wsMessage}`;
            throw e;
        } else {
            throw new Error(`json parse error\n${wsMessage}`);
        }
    }

    const isValid = validate(wsMessageJson);

    if (isValid) {
        return wsMessageJson as T;
    } else {
        throw new Error(`kafka message is invalid in json schema\n${JSON.stringify({
            message: wsMessageJson,
            schema: validate.schema
        }, null, 4)}`);
    }
}