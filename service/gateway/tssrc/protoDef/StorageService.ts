// Original file: ../proto/jcopy.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CreateTextRequest as _CreateTextRequest, CreateTextRequest__Output as _CreateTextRequest__Output } from './CreateTextRequest';
import type { CreateTextResponse as _CreateTextResponse, CreateTextResponse__Output as _CreateTextResponse__Output } from './CreateTextResponse';
import type { GetFilesRequest as _GetFilesRequest, GetFilesRequest__Output as _GetFilesRequest__Output } from './GetFilesRequest';
import type { GetFilesResponse as _GetFilesResponse, GetFilesResponse__Output as _GetFilesResponse__Output } from './GetFilesResponse';
import type { GetTextRequest as _GetTextRequest, GetTextRequest__Output as _GetTextRequest__Output } from './GetTextRequest';
import type { GetTextResponse as _GetTextResponse, GetTextResponse__Output as _GetTextResponse__Output } from './GetTextResponse';

export interface StorageServiceClient extends grpc.Client {
  CreateText(argument: _CreateTextRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_CreateTextResponse__Output>): grpc.ClientUnaryCall;
  CreateText(argument: _CreateTextRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_CreateTextResponse__Output>): grpc.ClientUnaryCall;
  CreateText(argument: _CreateTextRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_CreateTextResponse__Output>): grpc.ClientUnaryCall;
  CreateText(argument: _CreateTextRequest, callback: grpc.requestCallback<_CreateTextResponse__Output>): grpc.ClientUnaryCall;
  createText(argument: _CreateTextRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_CreateTextResponse__Output>): grpc.ClientUnaryCall;
  createText(argument: _CreateTextRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_CreateTextResponse__Output>): grpc.ClientUnaryCall;
  createText(argument: _CreateTextRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_CreateTextResponse__Output>): grpc.ClientUnaryCall;
  createText(argument: _CreateTextRequest, callback: grpc.requestCallback<_CreateTextResponse__Output>): grpc.ClientUnaryCall;
  
  GetFiles(argument: _GetFilesRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_GetFilesResponse__Output>): grpc.ClientUnaryCall;
  GetFiles(argument: _GetFilesRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_GetFilesResponse__Output>): grpc.ClientUnaryCall;
  GetFiles(argument: _GetFilesRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_GetFilesResponse__Output>): grpc.ClientUnaryCall;
  GetFiles(argument: _GetFilesRequest, callback: grpc.requestCallback<_GetFilesResponse__Output>): grpc.ClientUnaryCall;
  getFiles(argument: _GetFilesRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_GetFilesResponse__Output>): grpc.ClientUnaryCall;
  getFiles(argument: _GetFilesRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_GetFilesResponse__Output>): grpc.ClientUnaryCall;
  getFiles(argument: _GetFilesRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_GetFilesResponse__Output>): grpc.ClientUnaryCall;
  getFiles(argument: _GetFilesRequest, callback: grpc.requestCallback<_GetFilesResponse__Output>): grpc.ClientUnaryCall;
  
  GetText(argument: _GetTextRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_GetTextResponse__Output>): grpc.ClientUnaryCall;
  GetText(argument: _GetTextRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_GetTextResponse__Output>): grpc.ClientUnaryCall;
  GetText(argument: _GetTextRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_GetTextResponse__Output>): grpc.ClientUnaryCall;
  GetText(argument: _GetTextRequest, callback: grpc.requestCallback<_GetTextResponse__Output>): grpc.ClientUnaryCall;
  getText(argument: _GetTextRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_GetTextResponse__Output>): grpc.ClientUnaryCall;
  getText(argument: _GetTextRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_GetTextResponse__Output>): grpc.ClientUnaryCall;
  getText(argument: _GetTextRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_GetTextResponse__Output>): grpc.ClientUnaryCall;
  getText(argument: _GetTextRequest, callback: grpc.requestCallback<_GetTextResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface StorageServiceHandlers extends grpc.UntypedServiceImplementation {
  CreateText: grpc.handleUnaryCall<_CreateTextRequest__Output, _CreateTextResponse>;
  
  GetFiles: grpc.handleUnaryCall<_GetFilesRequest__Output, _GetFilesResponse>;
  
  GetText: grpc.handleUnaryCall<_GetTextRequest__Output, _GetTextResponse>;
  
}

export interface StorageServiceDefinition extends grpc.ServiceDefinition {
  CreateText: MethodDefinition<_CreateTextRequest, _CreateTextResponse, _CreateTextRequest__Output, _CreateTextResponse__Output>
  GetFiles: MethodDefinition<_GetFilesRequest, _GetFilesResponse, _GetFilesRequest__Output, _GetFilesResponse__Output>
  GetText: MethodDefinition<_GetTextRequest, _GetTextResponse, _GetTextRequest__Output, _GetTextResponse__Output>
}
