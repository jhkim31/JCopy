// package: jcopy
// file: jcopy.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class Empty extends jspb.Message { 

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Empty.AsObject;
    static toObject(includeInstance: boolean, msg: Empty): Empty.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Empty, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Empty;
    static deserializeBinaryFromReader(message: Empty, reader: jspb.BinaryReader): Empty;
}

export namespace Empty {
    export type AsObject = {
    }
}

export class CreateRoomRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): CreateRoomRequest;
    getClientsession(): string;
    setClientsession(value: string): CreateRoomRequest;
    getExpiretime(): number;
    setExpiretime(value: number): CreateRoomRequest;
    getNum(): number;
    setNum(value: number): CreateRoomRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateRoomRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateRoomRequest): CreateRoomRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateRoomRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateRoomRequest;
    static deserializeBinaryFromReader(message: CreateRoomRequest, reader: jspb.BinaryReader): CreateRoomRequest;
}

export namespace CreateRoomRequest {
    export type AsObject = {
        id: string,
        clientsession: string,
        expiretime: number,
        num: number,
    }
}

export class CreateRoomResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): CreateRoomResponse;
    getRoomid(): string;
    setRoomid(value: string): CreateRoomResponse;
    getTextid(): string;
    setTextid(value: string): CreateRoomResponse;
    clearFileidsList(): void;
    getFileidsList(): Array<string>;
    setFileidsList(value: Array<string>): CreateRoomResponse;
    addFileids(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateRoomResponse.AsObject;
    static toObject(includeInstance: boolean, msg: CreateRoomResponse): CreateRoomResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateRoomResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateRoomResponse;
    static deserializeBinaryFromReader(message: CreateRoomResponse, reader: jspb.BinaryReader): CreateRoomResponse;
}

export namespace CreateRoomResponse {
    export type AsObject = {
        id: string,
        roomid: string,
        textid: string,
        fileidsList: Array<string>,
    }
}

export class JoinRoomRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): JoinRoomRequest;
    getClientsession(): string;
    setClientsession(value: string): JoinRoomRequest;
    getRoomid(): string;
    setRoomid(value: string): JoinRoomRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): JoinRoomRequest.AsObject;
    static toObject(includeInstance: boolean, msg: JoinRoomRequest): JoinRoomRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: JoinRoomRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): JoinRoomRequest;
    static deserializeBinaryFromReader(message: JoinRoomRequest, reader: jspb.BinaryReader): JoinRoomRequest;
}

export namespace JoinRoomRequest {
    export type AsObject = {
        id: string,
        clientsession: string,
        roomid: string,
    }
}

export class JoinRoomResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): JoinRoomResponse;
    getResult(): string;
    setResult(value: string): JoinRoomResponse;
    getRoomid(): string;
    setRoomid(value: string): JoinRoomResponse;
    getTextid(): string;
    setTextid(value: string): JoinRoomResponse;
    clearFileidsList(): void;
    getFileidsList(): Array<string>;
    setFileidsList(value: Array<string>): JoinRoomResponse;
    addFileids(value: string, index?: number): string;
    getExpiretime(): string;
    setExpiretime(value: string): JoinRoomResponse;
    getLeftstorage(): number;
    setLeftstorage(value: number): JoinRoomResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): JoinRoomResponse.AsObject;
    static toObject(includeInstance: boolean, msg: JoinRoomResponse): JoinRoomResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: JoinRoomResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): JoinRoomResponse;
    static deserializeBinaryFromReader(message: JoinRoomResponse, reader: jspb.BinaryReader): JoinRoomResponse;
}

export namespace JoinRoomResponse {
    export type AsObject = {
        id: string,
        result: string,
        roomid: string,
        textid: string,
        fileidsList: Array<string>,
        expiretime: string,
        leftstorage: number,
    }
}

export class CreateTextRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): CreateTextRequest;
    getExpiretime(): number;
    setExpiretime(value: number): CreateTextRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateTextRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateTextRequest): CreateTextRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateTextRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateTextRequest;
    static deserializeBinaryFromReader(message: CreateTextRequest, reader: jspb.BinaryReader): CreateTextRequest;
}

export namespace CreateTextRequest {
    export type AsObject = {
        id: string,
        expiretime: number,
    }
}

export class CreateTextResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): CreateTextResponse;
    getTextid(): string;
    setTextid(value: string): CreateTextResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateTextResponse.AsObject;
    static toObject(includeInstance: boolean, msg: CreateTextResponse): CreateTextResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateTextResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateTextResponse;
    static deserializeBinaryFromReader(message: CreateTextResponse, reader: jspb.BinaryReader): CreateTextResponse;
}

export namespace CreateTextResponse {
    export type AsObject = {
        id: string,
        textid: string,
    }
}

export class GetJoinedSessionsRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): GetJoinedSessionsRequest;
    getRoomid(): string;
    setRoomid(value: string): GetJoinedSessionsRequest;
    getClientsession(): string;
    setClientsession(value: string): GetJoinedSessionsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetJoinedSessionsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetJoinedSessionsRequest): GetJoinedSessionsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetJoinedSessionsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetJoinedSessionsRequest;
    static deserializeBinaryFromReader(message: GetJoinedSessionsRequest, reader: jspb.BinaryReader): GetJoinedSessionsRequest;
}

export namespace GetJoinedSessionsRequest {
    export type AsObject = {
        id: string,
        roomid: string,
        clientsession: string,
    }
}

export class GetJoinedSessionsResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): GetJoinedSessionsResponse;
    getRoomid(): string;
    setRoomid(value: string): GetJoinedSessionsResponse;
    clearClientsessionsList(): void;
    getClientsessionsList(): Array<string>;
    setClientsessionsList(value: Array<string>): GetJoinedSessionsResponse;
    addClientsessions(value: string, index?: number): string;
    getLeftstorage(): number;
    setLeftstorage(value: number): GetJoinedSessionsResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetJoinedSessionsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetJoinedSessionsResponse): GetJoinedSessionsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetJoinedSessionsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetJoinedSessionsResponse;
    static deserializeBinaryFromReader(message: GetJoinedSessionsResponse, reader: jspb.BinaryReader): GetJoinedSessionsResponse;
}

export namespace GetJoinedSessionsResponse {
    export type AsObject = {
        id: string,
        roomid: string,
        clientsessionsList: Array<string>,
        leftstorage: number,
    }
}

export class GetTextRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): GetTextRequest;
    getTextid(): string;
    setTextid(value: string): GetTextRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetTextRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetTextRequest): GetTextRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetTextRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetTextRequest;
    static deserializeBinaryFromReader(message: GetTextRequest, reader: jspb.BinaryReader): GetTextRequest;
}

export namespace GetTextRequest {
    export type AsObject = {
        id: string,
        textid: string,
    }
}

export class GetTextResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): GetTextResponse;
    getTextvalue(): string;
    setTextvalue(value: string): GetTextResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetTextResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetTextResponse): GetTextResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetTextResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetTextResponse;
    static deserializeBinaryFromReader(message: GetTextResponse, reader: jspb.BinaryReader): GetTextResponse;
}

export namespace GetTextResponse {
    export type AsObject = {
        id: string,
        textvalue: string,
    }
}

export class GetFilesRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): GetFilesRequest;
    getTextid(): string;
    setTextid(value: string): GetFilesRequest;
    clearFileidsList(): void;
    getFileidsList(): Array<string>;
    setFileidsList(value: Array<string>): GetFilesRequest;
    addFileids(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetFilesRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetFilesRequest): GetFilesRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetFilesRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetFilesRequest;
    static deserializeBinaryFromReader(message: GetFilesRequest, reader: jspb.BinaryReader): GetFilesRequest;
}

export namespace GetFilesRequest {
    export type AsObject = {
        id: string,
        textid: string,
        fileidsList: Array<string>,
    }
}

export class GetFilesResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): GetFilesResponse;
    getTextvalue(): string;
    setTextvalue(value: string): GetFilesResponse;
    clearFilenamesList(): void;
    getFilenamesList(): Array<string>;
    setFilenamesList(value: Array<string>): GetFilesResponse;
    addFilenames(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetFilesResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetFilesResponse): GetFilesResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetFilesResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetFilesResponse;
    static deserializeBinaryFromReader(message: GetFilesResponse, reader: jspb.BinaryReader): GetFilesResponse;
}

export namespace GetFilesResponse {
    export type AsObject = {
        id: string,
        textvalue: string,
        filenamesList: Array<string>,
    }
}

export class GetLeftStorageRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): GetLeftStorageRequest;
    getRoomid(): string;
    setRoomid(value: string): GetLeftStorageRequest;
    getSize(): number;
    setSize(value: number): GetLeftStorageRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetLeftStorageRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetLeftStorageRequest): GetLeftStorageRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetLeftStorageRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetLeftStorageRequest;
    static deserializeBinaryFromReader(message: GetLeftStorageRequest, reader: jspb.BinaryReader): GetLeftStorageRequest;
}

export namespace GetLeftStorageRequest {
    export type AsObject = {
        id: string,
        roomid: string,
        size: number,
    }
}

export class GetLeftStorageResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): GetLeftStorageResponse;
    getRoomid(): string;
    setRoomid(value: string): GetLeftStorageResponse;
    getLeftstorage(): number;
    setLeftstorage(value: number): GetLeftStorageResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetLeftStorageResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetLeftStorageResponse): GetLeftStorageResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetLeftStorageResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetLeftStorageResponse;
    static deserializeBinaryFromReader(message: GetLeftStorageResponse, reader: jspb.BinaryReader): GetLeftStorageResponse;
}

export namespace GetLeftStorageResponse {
    export type AsObject = {
        id: string,
        roomid: string,
        leftstorage: number,
    }
}
