import { KafkaMessage, ProducerRecord } from "kafkajs";
import ajv from "@config/ajv";
import { v4 as uuid } from "uuid";
import IDeleteFile from "jcopy-shared/interface/kafka/IDeleteFile";
import IUpdateFiles from "jcopy-shared/interface/kafka/IUpdateFiles";
import parseKafkaMessage from "jcopy-shared/lib/parseKafkaMessage";
import { kafkaProducer } from "@config/kafka";
import logger from "@config/logger";
import { Room } from "@config/mongo";

export default async function delete_file(message: KafkaMessage) {
    const ajvSchemaKey = "kafka.DeleteFile";
    const validate = ajv.getSchema<IDeleteFile>(ajvSchemaKey);

    if (validate == undefined) {
        throw new Error(`ajv get schema error : ${ajvSchemaKey}`);
    }

    const deleteFileJsonMessage = parseKafkaMessage<IDeleteFile>(message, validate);

    const roomId = deleteFileJsonMessage.roomId;
    const filename = deleteFileJsonMessage.name;

    await Room.updateOne({ roomId: roomId }, { $pull: { fileIds: filename } })
        .then(d => {
            if (d.modifiedCount == 0) {
                logger.warn(`kafka delete_file mongo room not found : ${roomId}`);
            } else {
                logger.info(`kafka delete_file mongo delete file to room. \nroomId : ${roomId}\filename : ${filename}`);
            }
        })
        .catch(e => {
            if (e instanceof Error) {
                throw new Error(`kafka delete_file ${e.message}\n${JSON.stringify(deleteFileJsonMessage, null, 4)}`);
            } else {
                throw new Error(`kafka delete_file mongo update error\n${JSON.stringify(deleteFileJsonMessage, null, 4)}`);
            }
        })

    const room = await Room.findOne({ roomId: roomId })
        .then(d => {
            if (d?.roomId == roomId) {
                logger.info(`kafka delete_file success get mongodb\n${JSON.stringify(d, null, 4)}`);
            } else {
                throw new Error(`kafka delete_file error get mongodb\n${JSON.stringify(d, null, 4)}`);
            }
            return d;
        })
        .catch(e => {
            if (e instanceof Error) {
                throw new Error(`kafka delete_file ${e.message}\n${JSON.stringify(deleteFileJsonMessage, null, 4)}`);
            } else {
                throw new Error(`kafka delete_file mongo get room error\n${JSON.stringify(deleteFileJsonMessage, null, 4)}`);
            }
        })

    const updateFilesKafkaMessage: IUpdateFiles = {
        id: uuid(),
        roomId: roomId,
        clientId: room.clientIds,
        fileIds: room.fileIds,
        leftStorage: room.leftStorage
    }

    const kafkaRecord: ProducerRecord = {
        topic: "update_files",
        messages: [{ value: JSON.stringify(updateFilesKafkaMessage) }]
    }

    logger.debug(`kafka producer new record\n${JSON.stringify(kafkaRecord, null, 4)}`);

    await kafkaProducer
        .send(kafkaRecord)
        .then(d => {
            logger.debug(`kafka producer success send\n${JSON.stringify(d, null, 4)}`);
        })
        .catch(e => {
            logger.error(`kafka producer fail send\n${JSON.stringify(e, null, 4)}`);
        })
}