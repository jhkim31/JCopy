import { JSONSchemaType } from "ajv";
import ITextChanged from "../../interface/kafka/ITextChanged";

const TextChangedSchema: JSONSchemaType<ITextChanged> = {
    $id : "kafka.TextChanged",
    type : "object",
    properties : {        
        roomId : {
            type : "string"
        }, 
        textId : {
            type : "string"
        }, 
        textValue : {
            type : "string"
        },
        clientId : {
            "type" : "string"
        }
    },
    required: ["roomId", "textId", "textValue", "clientId"],
    additionalProperties: false
}

export default TextChangedSchema;