// package: jcopy
// file: jcopy.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as jcopy_pb from "./jcopy_pb";

interface IRoomService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    createRoom: IRoomService_ICreateRoom;
    joinRoom: IRoomService_IJoinRoom;
    getJoinedClientIds: IRoomService_IGetJoinedClientIds;
    getLeftStorage: IRoomService_IGetLeftStorage;
}

interface IRoomService_ICreateRoom extends grpc.MethodDefinition<jcopy_pb.CreateRoomRequest, jcopy_pb.CreateRoomResponse> {
    path: "/jcopy.Room/CreateRoom";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<jcopy_pb.CreateRoomRequest>;
    requestDeserialize: grpc.deserialize<jcopy_pb.CreateRoomRequest>;
    responseSerialize: grpc.serialize<jcopy_pb.CreateRoomResponse>;
    responseDeserialize: grpc.deserialize<jcopy_pb.CreateRoomResponse>;
}
interface IRoomService_IJoinRoom extends grpc.MethodDefinition<jcopy_pb.JoinRoomRequest, jcopy_pb.JoinRoomResponse> {
    path: "/jcopy.Room/JoinRoom";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<jcopy_pb.JoinRoomRequest>;
    requestDeserialize: grpc.deserialize<jcopy_pb.JoinRoomRequest>;
    responseSerialize: grpc.serialize<jcopy_pb.JoinRoomResponse>;
    responseDeserialize: grpc.deserialize<jcopy_pb.JoinRoomResponse>;
}
interface IRoomService_IGetJoinedClientIds extends grpc.MethodDefinition<jcopy_pb.GetJoinedClientIdsRequest, jcopy_pb.GetJoinedClientIdsResponse> {
    path: "/jcopy.Room/GetJoinedClientIds";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<jcopy_pb.GetJoinedClientIdsRequest>;
    requestDeserialize: grpc.deserialize<jcopy_pb.GetJoinedClientIdsRequest>;
    responseSerialize: grpc.serialize<jcopy_pb.GetJoinedClientIdsResponse>;
    responseDeserialize: grpc.deserialize<jcopy_pb.GetJoinedClientIdsResponse>;
}
interface IRoomService_IGetLeftStorage extends grpc.MethodDefinition<jcopy_pb.GetLeftStorageRequest, jcopy_pb.GetLeftStorageResponse> {
    path: "/jcopy.Room/GetLeftStorage";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<jcopy_pb.GetLeftStorageRequest>;
    requestDeserialize: grpc.deserialize<jcopy_pb.GetLeftStorageRequest>;
    responseSerialize: grpc.serialize<jcopy_pb.GetLeftStorageResponse>;
    responseDeserialize: grpc.deserialize<jcopy_pb.GetLeftStorageResponse>;
}

export const RoomService: IRoomService;

export interface IRoomServer extends grpc.UntypedServiceImplementation {
    createRoom: grpc.handleUnaryCall<jcopy_pb.CreateRoomRequest, jcopy_pb.CreateRoomResponse>;
    joinRoom: grpc.handleUnaryCall<jcopy_pb.JoinRoomRequest, jcopy_pb.JoinRoomResponse>;
    getJoinedClientIds: grpc.handleUnaryCall<jcopy_pb.GetJoinedClientIdsRequest, jcopy_pb.GetJoinedClientIdsResponse>;
    getLeftStorage: grpc.handleUnaryCall<jcopy_pb.GetLeftStorageRequest, jcopy_pb.GetLeftStorageResponse>;
}

export interface IRoomClient {
    createRoom(request: jcopy_pb.CreateRoomRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.CreateRoomResponse) => void): grpc.ClientUnaryCall;
    createRoom(request: jcopy_pb.CreateRoomRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.CreateRoomResponse) => void): grpc.ClientUnaryCall;
    createRoom(request: jcopy_pb.CreateRoomRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.CreateRoomResponse) => void): grpc.ClientUnaryCall;
    joinRoom(request: jcopy_pb.JoinRoomRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.JoinRoomResponse) => void): grpc.ClientUnaryCall;
    joinRoom(request: jcopy_pb.JoinRoomRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.JoinRoomResponse) => void): grpc.ClientUnaryCall;
    joinRoom(request: jcopy_pb.JoinRoomRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.JoinRoomResponse) => void): grpc.ClientUnaryCall;
    getJoinedClientIds(request: jcopy_pb.GetJoinedClientIdsRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetJoinedClientIdsResponse) => void): grpc.ClientUnaryCall;
    getJoinedClientIds(request: jcopy_pb.GetJoinedClientIdsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetJoinedClientIdsResponse) => void): grpc.ClientUnaryCall;
    getJoinedClientIds(request: jcopy_pb.GetJoinedClientIdsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetJoinedClientIdsResponse) => void): grpc.ClientUnaryCall;
    getLeftStorage(request: jcopy_pb.GetLeftStorageRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetLeftStorageResponse) => void): grpc.ClientUnaryCall;
    getLeftStorage(request: jcopy_pb.GetLeftStorageRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetLeftStorageResponse) => void): grpc.ClientUnaryCall;
    getLeftStorage(request: jcopy_pb.GetLeftStorageRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetLeftStorageResponse) => void): grpc.ClientUnaryCall;
}

export class RoomClient extends grpc.Client implements IRoomClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public createRoom(request: jcopy_pb.CreateRoomRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.CreateRoomResponse) => void): grpc.ClientUnaryCall;
    public createRoom(request: jcopy_pb.CreateRoomRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.CreateRoomResponse) => void): grpc.ClientUnaryCall;
    public createRoom(request: jcopy_pb.CreateRoomRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.CreateRoomResponse) => void): grpc.ClientUnaryCall;
    public joinRoom(request: jcopy_pb.JoinRoomRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.JoinRoomResponse) => void): grpc.ClientUnaryCall;
    public joinRoom(request: jcopy_pb.JoinRoomRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.JoinRoomResponse) => void): grpc.ClientUnaryCall;
    public joinRoom(request: jcopy_pb.JoinRoomRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.JoinRoomResponse) => void): grpc.ClientUnaryCall;
    public getJoinedClientIds(request: jcopy_pb.GetJoinedClientIdsRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetJoinedClientIdsResponse) => void): grpc.ClientUnaryCall;
    public getJoinedClientIds(request: jcopy_pb.GetJoinedClientIdsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetJoinedClientIdsResponse) => void): grpc.ClientUnaryCall;
    public getJoinedClientIds(request: jcopy_pb.GetJoinedClientIdsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetJoinedClientIdsResponse) => void): grpc.ClientUnaryCall;
    public getLeftStorage(request: jcopy_pb.GetLeftStorageRequest, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetLeftStorageResponse) => void): grpc.ClientUnaryCall;
    public getLeftStorage(request: jcopy_pb.GetLeftStorageRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetLeftStorageResponse) => void): grpc.ClientUnaryCall;
    public getLeftStorage(request: jcopy_pb.GetLeftStorageRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jcopy_pb.GetLeftStorageResponse) => void): grpc.ClientUnaryCall;
}

interface IStorageService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    createText: IStorageService_ICreateText;
    getFiles: IStorageService_IGetFiles;
    getText: IStorageService_IGetText;
}

interface IStorageService_ICreateText extends grpc.MethodDefinition<jcopy_pb.CreateTextRequest, jcopy_pb.CreateTextResponse> {
    path: "/jcopy.Storage/CreateText";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<jcopy_pb.CreateTextRequest>;
    requestDeserialize: grpc.deserialize<jcopy_pb.CreateTextRequest>;
    responseSerialize: grpc.serialize<jcopy_pb.CreateTextResponse>;
    responseDeserialize: grpc.deserialize<jcopy_pb.CreateTextResponse>;
}
interface IStorageService_IGetFiles extends grpc.MethodDefinition<jcopy_pb.GetFilesRequest, jcopy_pb.GetFilesResponse> {
    path: "/jcopy.Storage/GetFiles";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<jcopy_pb.GetFilesRequest>;
    requestDeserialize: grpc.deserialize<jcopy_pb.GetFilesRequest>;
    responseSerialize: grpc.serialize<jcopy_pb.GetFilesResponse>;
    responseDeserialize: grpc.deserialize<jcopy_pb.GetFilesResponse>;
}
interface IStorageService_IGetText extends grpc.MethodDefinition<jcopy_pb.GetTextRequest, jcopy_pb.GetTextResponse> {
    path: "/jcopy.Storage/GetText";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<jcopy_pb.GetTextRequest>;
    requestDeserialize: grpc.deserialize<jcopy_pb.GetTextRequest>;
    responseSerialize: grpc.serialize<jcopy_pb.GetTextResponse>;
    responseDeserialize: grpc.deserialize<jcopy_pb.GetTextResponse>;
}

export const StorageService: IStorageService;

export interface IStorageServer extends grpc.UntypedServiceImplementation {
    createText: grpc.handleUnaryCall<jcopy_pb.CreateTextRequest, jcopy_pb.CreateTextResponse>;
    getFiles: grpc.handleUnaryCall<jcopy_pb.GetFilesRequest, jcopy_pb.GetFilesResponse>;
    getText: grpc.handleUnaryCall<jcopy_pb.GetTextRequest, jcopy_pb.GetTextResponse>;
}

export interface IStorageClient {
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

export class StorageClient extends grpc.Client implements IStorageClient {
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
