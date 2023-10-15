import Ajv from "ajv";

import UploadFileSchema from "shared/schema/kafka/UploadFileSchema";
import DeleteFileSchema from "shared/schema/kafka/DeleteFileSchema";

const ajv = new Ajv();

ajv.addSchema(DeleteFileSchema);
ajv.addSchema(UploadFileSchema);

export default ajv;

