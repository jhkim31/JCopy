import { JSONSchemaType } from "ajv";
import IUploadFile from "../../interface/kafka/IUploadFile";

const UploadFileSchema: JSONSchemaType<IUploadFile> = {
    $id : "kafka.UploadFile",
    type : "object",
    properties : {        
        id : {
            type : "string"            
        }, 
        roomId : {
            type : "string"
        }, 
        size : {
            type : "number"
        },
        name : {
            "type" : "string"
        }
    },
    required: ["id", "roomId", "size", "name"],
    additionalProperties: false
}

export default UploadFileSchema;