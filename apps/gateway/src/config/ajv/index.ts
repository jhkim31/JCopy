import Ajv from "ajv";

import TextChangedSchema from "jcopy-shared/schema/kafka/TextChangedSchema"; 
import UpdateFilesSchema from "jcopy-shared/schema/kafka/UpdateFilesSchema"; 

const ajv = new Ajv();

ajv.addSchema(TextChangedSchema);
ajv.addSchema(UpdateFilesSchema);

export default ajv;

