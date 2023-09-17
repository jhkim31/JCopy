// package: 
// file: jcopy.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as jcopy_pb from "./jcopy_pb";

interface IRoomServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    createRoom: IRoomServiceService_ICreateRoom;
    joinRoom: IRoomServiceService_IJoinRoom;
    getJoinedSessions: IRoomServiceService_IGetJoinedSessions;
    getLeftStorage: IRoomServiceService_IGetLeftStorage;
}

interface IRoomServiceService_ICreateRoom extends grpc.MethodDefinition<jcopy_pb.CreateRoomRequest, jcopy_pb.CreateRoomResponse> {
    path: "/RoomService/CreateRoom";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<jcopy_pb.CreateRoomRequest>;
    requestDeserialize: grpc.deserialize<jcopy_pb.CreateRoomRequest>;
    responseSerialize: grpc.serialize<jcopy_pb.CreateRoomResponse>;
    responseDeserialize: grpc.deserialize<jcopy_pb.CreateRoomResponse>;
}
interface IRoomServiceService_IJoinRoom extends grpc.MethodDefinition<jcopy_pb.JoinRoomRequest, jcopy_pb.JoinRoomResponse> {
    path: "/RoomService/JoinRoom";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<jcopy_pb.JoinRoomRequest>;
    requestDeserialize: grpc.deserialize<jcopy_pb.JoinRoomRequest>;
    responseSerialize: grpc.serialize<jcopy_pb.JoinRoomResponse>;
    responseDeserialize: grpc.deserialize<jcopy_pb.JoinRoomResponse>;
}
interface IRoomServiceService_IGetJoinedSessions extends grpc.MethodDefinition<jcopy_pb.GetJoinedSessionsRequest, jcopy_pb.GetJoinedSessionsResponse> {
    path: "/RoomService/GetJoinedSessions";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<jcopy_pb.GetJoinedSessionsRequest>;
    requestDeserialize: grpc.deserialize<jcopy_pb.GetJoinedSessionsRequest>;
    responseSerialize: grpc.serialize<jcopy_pb.GetJoinedSessionsResponse>;
    responseDeserialize: grpc.deserialize<jcopy_pb.GetJoinedSessionsResponse>;
}
interface IRoomServiceService_IGetLeftStorage extends grpc.MethodDefinition<jcopy_pb.GetLeftStorageRequest, jcopy_pb.GetLeftStorageResponse> {
    path: "/RoomService/GetLeftStorage";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<jcopy_pb.GetLeftStorageRequest>;
    requestDeserialize: grpc.deserialize<jcopy_pb.GetLeftStorageRequest>;
    responseSerialize: grpc.serialize<jcopy_pb.GetLeftStorageResponse>;
    responseDeserialize: grpc.deserialize<jcopy_pb.GetLeftStorageResponse>;
}

export const RoomServiceService: IRoomServiceService;

export interface IRoomServiceServer extends grpc.UntypedServiceImplementation {
    createRoom: grpc.handleUnaryCall<jcopy_pb.CreateRoomRequest, jcopy_pb.CreateRoomResponse>;
    joinRoom: grpc.handleUnaryCall<jcopy_pb.JoinRoomRequest, jcopy_pb.JoinRoomResponse>;
    getJoinedSessions: grpc.handleUnaryCall<jcopy_pb.GetJoinedSessionsRequest, jcopy_pb.GetJoinedSessionsResponse>;
    getLeftStorage: grpc.handleUnaryCall<jcopy_pb.GetLeftStorageRequest, jcopy_pb.GetLeftStorageResponse>;
}

export interface IRoomServiceClient {
    createRoom(request: jcopy_pb.CreateRoomRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.CreateRoomResponse) => void): grpc.ClientUnaryCall;
    createRoom(request: jcopy_pb.CreateRoomRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.CreateRoomResponse) => void): grpc.ClientUnaryCall;
    createRoom(request: jcopy_pb.CreateRoomRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.CreateRoomResponse) => void): grpc.ClientUnaryCall;
    joinRoom(request: jcopy_pb.JoinRoomRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.JoinRoomResponse) => void): grpc.ClientUnaryCall;
    joinRoom(request: jcopy_pb.JoinRoomRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.JoinRoomResponse) => void): grpc.ClientUnaryCall;
    joinRoom(request: jcopy_pb.JoinRoomRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.JoinRoomResponse) => void): grpc.ClientUnaryCall;
    getJoinedSessions(request: jcopy_pb.GetJoinedSessionsRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetJoinedSessionsResponse) => void): grpc.ClientUnaryCall;
    getJoinedSessions(request: jcopy_pb.GetJoinedSessionsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetJoinedSessionsResponse) => void): grpc.ClientUnaryCall;
    getJoinedSessions(request: jcopy_pb.GetJoinedSessionsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetJoinedSessionsResponse) => void): grpc.ClientUnaryCall;
    getLeftStorage(request: jcopy_pb.GetLeftStorageRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetLeftStorageResponse) => void): grpc.ClientUnaryCall;
    getLeftStorage(request: jcopy_pb.GetLeftStorageRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetLeftStorageResponse) => void): grpc.ClientUnaryCall;
    getLeftStorage(request: jcopy_pb.GetLeftStorageRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetLeftStorageResponse) => void): grpc.ClientUnaryCall;
}

export class RoomServiceClient extends grpc.Client implements IRoomServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public createRoom(request: jcopy_pb.CreateRoomRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.CreateRoomResponse) => void): grpc.ClientUnaryCall;
    public createRoom(request: jcopy_pb.CreateRoomRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.CreateRoomResponse) => void): grpc.ClientUnaryCall;
    public createRoom(request: jcopy_pb.CreateRoomRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.CreateRoomResponse) => void): grpc.ClientUnaryCall;
    public joinRoom(request: jcopy_pb.JoinRoomRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.JoinRoomResponse) => void): grpc.ClientUnaryCall;
    public joinRoom(request: jcopy_pb.JoinRoomRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.JoinRoomResponse) => void): grpc.ClientUnaryCall;
    public joinRoom(request: jcopy_pb.JoinRoomRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.JoinRoomResponse) => void): grpc.ClientUnaryCall;
    public getJoinedSessions(request: jcopy_pb.GetJoinedSessionsRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetJoinedSessionsResponse) => void): grpc.ClientUnaryCall;
    public getJoinedSessions(request: jcopy_pb.GetJoinedSessionsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetJoinedSessionsResponse) => void): grpc.ClientUnaryCall;
    public getJoinedSessions(request: jcopy_pb.GetJoinedSessionsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetJoinedSessionsResponse) => void): grpc.ClientUnaryCall;
    public getLeftStorage(request: jcopy_pb.GetLeftStorageRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetLeftStorageResponse) => void): grpc.ClientUnaryCall;
    public getLeftStorage(request: jcopy_pb.GetLeftStorageRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetLeftStorageResponse) => void): grpc.ClientUnaryCall;
    public getLeftStorage(request: jcopy_pb.GetLeftStorageRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetLeftStorageResponse) => void): grpc.ClientUnaryCall;
}

interface IStorageServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    createText: IStorageServiceService_ICreateText;
    getFiles: IStorageServiceService_IGetFiles;
    getText: IStorageServiceService_IGetText;
}

interface IStorageServiceService_ICreateText extends grpc.MethodDefinition<jcopy_pb.CreateTextRequest, jcopy_pb.CreateTextResponse> {
    path: "/StorageService/CreateText";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<jcopy_pb.CreateTextRequest>;
    requestDeserialize: grpc.deserialize<jcopy_pb.CreateTextRequest>;
    responseSerialize: grpc.serialize<jcopy_pb.CreateTextResponse>;
    responseDeserialize: grpc.deserialize<jcopy_pb.CreateTextResponse>;
}
interface IStorageServiceService_IGetFiles extends grpc.MethodDefinition<jcopy_pb.GetFilesRequest, jcopy_pb.GetFilesResponse> {
    path: "/StorageService/GetFiles";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<jcopy_pb.GetFilesRequest>;
    requestDeserialize: grpc.deserialize<jcopy_pb.GetFilesRequest>;
    responseSerialize: grpc.serialize<jcopy_pb.GetFilesResponse>;
    responseDeserialize: grpc.deserialize<jcopy_pb.GetFilesResponse>;
}
interface IStorageServiceService_IGetText extends grpc.MethodDefinition<jcopy_pb.GetTextRequest, jcopy_pb.GetTextResponse> {
    path: "/StorageService/GetText";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<jcopy_pb.GetTextRequest>;
    requestDeserialize: grpc.deserialize<jcopy_pb.GetTextRequest>;
    responseSerialize: grpc.serialize<jcopy_pb.GetTextResponse>;
    responseDeserialize: grpc.deserialize<jcopy_pb.GetTextResponse>;
}

export const StorageServiceService: IStorageServiceService;

export interface IStorageServiceServer extends grpc.UntypedServiceImplementation {
    createText: grpc.handleUnaryCall<jcopy_pb.CreateTextRequest, jcopy_pb.CreateTextResponse>;
    getFiles: grpc.handleUnaryCall<jcopy_pb.GetFilesRequest, jcopy_pb.GetFilesResponse>;
    getText: grpc.handleUnaryCall<jcopy_pb.GetTextRequest, jcopy_pb.GetTextResponse>;
}

export interface IStorageServiceClient {
    createText(request: jcopy_pb.CreateTextRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.CreateTextResponse) => void): grpc.ClientUnaryCall;
    createText(request: jcopy_pb.CreateTextRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.CreateTextResponse) => void): grpc.ClientUnaryCall;
    createText(request: jcopy_pb.CreateTextRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.CreateTextResponse) => void): grpc.ClientUnaryCall;
    getFiles(request: jcopy_pb.GetFilesRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetFilesResponse) => void): grpc.ClientUnaryCall;
    getFiles(request: jcopy_pb.GetFilesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetFilesResponse) => void): grpc.ClientUnaryCall;
    getFiles(request: jcopy_pb.GetFilesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetFilesResponse) => void): grpc.ClientUnaryCall;
    getText(request: jcopy_pb.GetTextRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetTextResponse) => void): grpc.ClientUnaryCall;
    getText(request: jcopy_pb.GetTextRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetTextResponse) => void): grpc.ClientUnaryCall;
    getText(request: jcopy_pb.GetTextRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetTextResponse) => void): grpc.ClientUnaryCall;
}

export class StorageServiceClient extends grpc.Client implements IStorageServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public createText(request: jcopy_pb.CreateTextRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.CreateTextResponse) => void): grpc.ClientUnaryCall;
    public createText(request: jcopy_pb.CreateTextRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.CreateTextResponse) => void): grpc.ClientUnaryCall;
    public createText(request: jcopy_pb.CreateTextRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.CreateTextResponse) => void): grpc.ClientUnaryCall;
    public getFiles(request: jcopy_pb.GetFilesRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetFilesResponse) => void): grpc.ClientUnaryCall;
    public getFiles(request: jcopy_pb.GetFilesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetFilesResponse) => void): grpc.ClientUnaryCall;
    public getFiles(request: jcopy_pb.GetFilesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetFilesResponse) => void): grpc.ClientUnaryCall;
    public getText(request: jcopy_pb.GetTextRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetTextResponse) => void): grpc.ClientUnaryCall;
    public getText(request: jcopy_pb.GetTextRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetTextResponse) => void): grpc.ClientUnaryCall;
    public getText(request: jcopy_pb.GetTextRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetTextResponse) => void): grpc.ClientUnaryCall;
}
