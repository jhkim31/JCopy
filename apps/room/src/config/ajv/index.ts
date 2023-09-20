import Ajv from "ajv";

import UploadFileSchema from "jcopy-shared/schema/kafka/UploadFileSchema";
import DeleteFileSchema from "jcopy-shared/schema/kafka/DeleteFileSchema";

const ajv = new Ajv();

ajv.addSchema(DeleteFileSchema);
ajv.addSchema(UploadFileSchema);

export default ajv;

