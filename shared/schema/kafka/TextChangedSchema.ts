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
        clientSession : {
            "type" : "string"
        }
    },
    required: ["roomId", "textId", "textValue", "clientSession"],
    additionalProperties: false
}

export default TextChangedSchema;