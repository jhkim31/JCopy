import { JSONSchemaType } from "ajv";
import IUpdateFiles from "../../interface/kafka/IUpdateFiles";

const UpdateFilesSchema: JSONSchemaType<IUpdateFiles> = {
    $id : "kafka.UpdateFiles",
    type : "object",
    properties : {        
        id : {
            type : "string"            
        }, 
        roomId : {
            type : "string"
        }, 
        clientId : {            
            type : "array",
            items: {type: "string"}
        },
        fileIds : {
            type : "array",
            items: {type: "string"}
        },
        leftStorage: {
            type: "number"
        }
    },
    required: ["id", "roomId", "clientId", "fileIds", "leftStorage"],
    additionalProperties: false
}

export default UpdateFilesSchema;