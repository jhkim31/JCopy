import { KafkaMessage, ProducerRecord } from "kafkajs";
import ajv from "@config/ajv";
import { v4 as uuid } from "uuid";
import parseKafkaMessage from "jcopy-shared/lib/parseKafkaMessage";
import logger from "@config/logger";
import ITextChanged from "jcopy-shared/interface/kafka/ITextChanged";
import { GetJoinedSessionsRequest, GetJoinedSessionsResponse } from "jcopy-shared/proto/jcopy_pb";
import { grpcRoomClient } from "@config/grpc";
import { wsClients } from "@config/ws";
import WebSocket from "ws";

export default async function text_changed(message: KafkaMessage) {
    const ajvSchemaKey = "kafka.TextChanged";
    const validate = ajv.getSchema<ITextChanged>(ajvSchemaKey);

    if (validate == undefined) {
        throw new Error(`ajv get schema error : ${ajvSchemaKey}`);
    }

    const textChangedJsonMessage = parseKafkaMessage<ITextChanged>(message, validate);
    const requestRoomId = textChangedJsonMessage.roomId;
    const requestClientSession = textChangedJsonMessage.clientSession;
    const requestTextValue = textChangedJsonMessage.textValue;

    const getJoinedSessionRequest = new GetJoinedSessionsRequest();

    getJoinedSessionRequest.setId(uuid());
    getJoinedSessionRequest.setRoomid(requestRoomId);
    getJoinedSessionRequest.setClientsession(requestClientSession);

    const getJoinedSessionsResponse = await GetJoinedSessions(getJoinedSessionRequest);

    for (const joinedSession of getJoinedSessionsResponse.getClientsessionsList()) {
        if (requestClientSession != joinedSession) {
            const wsClient: WebSocket = wsClients[joinedSession];

            if (wsClient) {
                wsClient.send(JSON.stringify({
                    type: "text",
                    msg: requestTextValue
                }));                
            }
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
