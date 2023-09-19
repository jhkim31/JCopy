import { JSONSchemaType } from "ajv";
import IChangeText from "../../interface/kafka/IChangeText";

const ChangeTextSchema: JSONSchemaType<IChangeText> = {
    $id : "kafka.ChangeText",
    type : "object",
    properties : {
        id : {
            type : "string"
        },
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
    required: ["id", "roomId", "textId", "textValue", "clientSession"],
    additionalProperties: false
}

export default ChangeTextSchema;