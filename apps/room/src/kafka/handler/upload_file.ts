import { KafkaMessage } from "kafkajs";
import ajv from "@config/ajv";
import { v4 as uuid } from "uuid";
import IUploadFile from "shared/interface/kafka/IUploadFile";
import IUpdateFiles from "shared/interface/kafka/IUpdateFiles";
import parseKafkaMessage from "shared/lib/parseKafkaMessage";
import { kafkaProducer } from "@config/kafka";
import logger from "@config/logger";
import { Room } from "@config/mongo";

export default async function upload_file(message: KafkaMessage) {
    const ajvSchemaKey = "kafka.UploadFile";
    const validate = ajv.getSchema<IUploadFile>(ajvSchemaKey);

    if (validate == undefined) {
        throw new Error(`ajv get schema error : ${ajvSchemaKey}`);
    }

    const uploadFileJsonMessage = parseKafkaMessage<IUploadFile>(message, validate);

    const roomId = uploadFileJsonMessage.roomId;
    const filename = uploadFileJsonMessage.name;
    const filesize = uploadFileJsonMessage.size;

    const room = await Room.findOne({ roomId: roomId })
        .then(d => {
            if (d?.roomId == roomId) {
                logger.info(`kafka upload_file success get mongodb\n${JSON.stringify(d, null, 4)}`);
            } else {
                throw new Error(`kafka upload_file error get mongodb\n${JSON.stringify(d, null, 4)}`);
            }
            return d;
        })
        .catch(e => {
            if (e instanceof Error) {
                throw new Error(`kafka upload_file ${e.message}\n${JSON.stringify(uploadFileJsonMessage, null, 4)}`);
            } else {
                throw new Error(`kafka upload_file mongo get room error\n${JSON.stringify(uploadFileJsonMessage, null, 4)}`);
            }
        })

    const leftStorage = room.leftStorage;

    if (leftStorage - filesize < 0) {
        throw new Error(`kafka upload_file no more storage left : ${leftStorage} filesize : ${filesize}\n${JSON.stringify(uploadFileJsonMessage, null, 4)}`);
    }

    await Room.updateOne(
        {
            roomId: roomId
        },
        {
            $push: { fileIds: filename },
            $set: { leftStorage: leftStorage - filesize },
        })
        .then(d => {
            if (d.modifiedCount == 0) {
                logger.warn(`kafka upload_file mongo room not found : ${roomId}`);
            } else {
                logger.info(`kafka upload_file mongo update file list, size. \n${JSON.stringify(uploadFileJsonMessage, null, 4)}`);
            }
        })
        .catch(e => {
            if (e instanceof Error) {
                throw new Error(`kafka upload_file ${e.message}\n${JSON.stringify(uploadFileJsonMessage, null, 4)}`);
            } else {
                throw new Error(`kafka upload_file mongo update error\n${JSON.stringify(uploadFileJsonMessage, null, 4)}`);
            }
        })


    const updatedRoom = await Room.findOne({ roomId: roomId })
        .then(d => {
            if (d?.roomId == roomId) {
                logger.info(`kafka upload_file success updated room\n${JSON.stringify(d, null, 4)}`);
            } else {
                throw new Error(`kafka upload_file error get mongodb\n${JSON.stringify(d, null, 4)}`);
            }
            return d;
        })
        .catch(e => {
            if (e instanceof Error) {
                throw new Error(`kafka upload_file ${e.message}\n${JSON.stringify(uploadFileJsonMessage, null, 4)}`);
            } else {
                throw new Error(`kafka upload_file mongo get room error\n${JSON.stringify(uploadFileJsonMessage, null, 4)}`);
            }
        })


    const updateFilesKafkaMessage: IUpdateFiles = {
        id: uuid(),
        roomId: roomId,
        clientId: updatedRoom.clientIds,
        fileIds: updatedRoom.fileIds,
        leftStorage: updatedRoom.leftStorage
    }

    const kafkaRecord = {
        topic: "update_files",
        messages: [{ value: JSON.stringify(updateFilesKafkaMessage) }]
    }    

    await kafkaProducer
        .send(kafkaRecord)
        .then(d => {
            logger.debug(`kafka producer success send\n${JSON.stringify(d, null, 4)}`);
        })
        .catch(e => {
            logger.error(`kafka producer fail send\n${JSON.stringify(e, null, 4)}`);
        })
}