import { JSONSchemaType } from "ajv";
import IDeleteFile from "../../interface/kafka/IDeleteFile";

const DeleteFileSchema: JSONSchemaType<IDeleteFile> = {
    $id : "kafka.DeleteFile",
    type : "object",
    properties : {        
        id : {
            type : "string"
        }, 
        roomId : {
            type : "string"
        }, 
        name : {
            type : "string"
        },        
    },
    required: ["id", "roomId", "name"],
    additionalProperties: false
}

export default DeleteFileSchema;