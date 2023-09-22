import { KafkaMessage } from "kafkajs";
import ajv from "@config/ajv";
import { v4 as uuid } from "uuid";
import IUpdateFiles from "jcopy-shared/interface/kafka/IUpdateFiles";
import parseKafkaMessage from "jcopy-shared/lib/parseKafkaMessage";
import logger from "@config/logger";
import { GetJoinedSessionsRequest, GetJoinedSessionsResponse } from "jcopy-shared/proto/jcopy_pb";
import { grpcRoomClient } from "@config/grpc";
import { wsClients } from "@config/ws";
import WebSocket from "ws";

export default async function update_files(message: KafkaMessage) {
    const ajvSchemaKey = "kafka.UpdateFiles";
    const validate = ajv.getSchema<IUpdateFiles>(ajvSchemaKey);

    if (validate == undefined) {
        throw new Error(`ajv get schema error : ${ajvSchemaKey}`);
    }

    const updateFilesJsonMessage = parseKafkaMessage<IUpdateFiles>(message, validate);
    const requestRoomId = updateFilesJsonMessage.roomId;
    const requestFileIds = updateFilesJsonMessage.fileIds;
    const requestLeftStorage = updateFilesJsonMessage.leftStorage;
    const requestClientSession = updateFilesJsonMessage.clientSession;

    const getJoinedSessionRequest = new GetJoinedSessionsRequest();


    getJoinedSessionRequest.setId(uuid());
    getJoinedSessionRequest.setRoomid(requestRoomId);
    /**
     * TODO
     * 이부분 이상함. ClientSession이 필요없는데 보냄.
     */
    getJoinedSessionRequest.setClientsession("");

    const getJoinedSessionsResponse = await GetJoinedSessions(getJoinedSessionRequest);

    for (const joinedSession of getJoinedSessionsResponse.getClientsessionsList()) {
        const wsClient: WebSocket = wsClients[joinedSession];

        if (wsClient) {
            wsClient.send(JSON.stringify({
                type: "file",
                fileIds: requestFileIds,
                leftStorage: requestLeftStorage
            }));
        }
    }
}

async function GetJoinedSessions(getJoinedSessionsRequest: GetJoinedSessionsRequest): Promise<GetJoinedSessionsResponse> {
    return new Promise((resolve, reject) => {
        grpcRoomClient.getJoinedSessions(getJoinedSessionsRequest, (error, response: GetJoinedSessionsResponse) => {
            if (error) {
                reject(error);
            } else {
                resolve(response)
            }
        })
    })
}
