import Ajv from "ajv";

import ChangeTextSchema from "shared/schema/kafka/ChangeTextSchema";

const ajv = new Ajv();

ajv.addSchema(ChangeTextSchema);

export default ajv;

