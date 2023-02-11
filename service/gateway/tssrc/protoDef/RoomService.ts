// Original file: ../proto/jcopy.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CreateRoomRequest as _CreateRoomRequest, CreateRoomRequest__Output as _CreateRoomRequest__Output } from './CreateRoomRequest';
import type { CreateRoomResponse as _CreateRoomResponse, CreateRoomResponse__Output as _CreateRoomResponse__Output } from './CreateRoomResponse';
import type { GetJoinedSessionsRequest as _GetJoinedSessionsRequest, GetJoinedSessionsRequest__Output as _GetJoinedSessionsRequest__Output } from './GetJoinedSessionsRequest';
import type { GetJoinedSessionsResponse as _GetJoinedSessionsResponse, GetJoinedSessionsResponse__Output as _GetJoinedSessionsResponse__Output } from './GetJoinedSessionsResponse';
import type { GetLeftStorageRequest as _GetLeftStorageRequest, GetLeftStorageRequest__Output as _GetLeftStorageRequest__Output } from './GetLeftStorageRequest';
import type { GetLeftStorageResponse as _GetLeftStorageResponse, GetLeftStorageResponse__Output as _GetLeftStorageResponse__Output } from './GetLeftStorageResponse';
import type { JoinRoomRequest as _JoinRoomRequest, JoinRoomRequest__Output as _JoinRoomRequest__Output } from './JoinRoomRequest';
import type { JoinRoomResponse as _JoinRoomResponse, JoinRoomResponse__Output as _JoinRoomResponse__Output } from './JoinRoomResponse';

export interface RoomServiceClient extends grpc.Client {
  CreateRoom(argument: _CreateRoomRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_CreateRoomResponse__Output>): grpc.ClientUnaryCall;
  CreateRoom(argument: _CreateRoomRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_CreateRoomResponse__Output>): grpc.ClientUnaryCall;
  CreateRoom(argument: _CreateRoomRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_CreateRoomResponse__Output>): grpc.ClientUnaryCall;
  CreateRoom(argument: _CreateRoomRequest, callback: grpc.requestCallback<_CreateRoomResponse__Output>): grpc.ClientUnaryCall;
  createRoom(argument: _CreateRoomRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_CreateRoomResponse__Output>): grpc.ClientUnaryCall;
  createRoom(argument: _CreateRoomRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_CreateRoomResponse__Output>): grpc.ClientUnaryCall;
  createRoom(argument: _CreateRoomRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_CreateRoomResponse__Output>): grpc.ClientUnaryCall;
  createRoom(argument: _CreateRoomRequest, callback: grpc.requestCallback<_CreateRoomResponse__Output>): grpc.ClientUnaryCall;
  
  GetJoinedSessions(argument: _GetJoinedSessionsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_GetJoinedSessionsResponse__Output>): grpc.ClientUnaryCall;
  GetJoinedSessions(argument: _GetJoinedSessionsRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_GetJoinedSessionsResponse__Output>): grpc.ClientUnaryCall;
  GetJoinedSessions(argument: _GetJoinedSessionsRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_GetJoinedSessionsResponse__Output>): grpc.ClientUnaryCall;
  GetJoinedSessions(argument: _GetJoinedSessionsRequest, callback: grpc.requestCallback<_GetJoinedSessionsResponse__Output>): grpc.ClientUnaryCall;
  getJoinedSessions(argument: _GetJoinedSessionsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_GetJoinedSessionsResponse__Output>): grpc.ClientUnaryCall;
  getJoinedSessions(argument: _GetJoinedSessionsRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_GetJoinedSessionsResponse__Output>): grpc.ClientUnaryCall;
  getJoinedSessions(argument: _GetJoinedSessionsRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_GetJoinedSessionsResponse__Output>): grpc.ClientUnaryCall;
  getJoinedSessions(argument: _GetJoinedSessionsRequest, callback: grpc.requestCallback<_GetJoinedSessionsResponse__Output>): grpc.ClientUnaryCall;
  
  GetLeftStorage(argument: _GetLeftStorageRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_GetLeftStorageResponse__Output>): grpc.ClientUnaryCall;
  GetLeftStorage(argument: _GetLeftStorageRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_GetLeftStorageResponse__Output>): grpc.ClientUnaryCall;
  GetLeftStorage(argument: _GetLeftStorageRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_GetLeftStorageResponse__Output>): grpc.ClientUnaryCall;
  GetLeftStorage(argument: _GetLeftStorageRequest, callback: grpc.requestCallback<_GetLeftStorageResponse__Output>): grpc.ClientUnaryCall;
  getLeftStorage(argument: _GetLeftStorageRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_GetLeftStorageResponse__Output>): grpc.ClientUnaryCall;
  getLeftStorage(argument: _GetLeftStorageRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_GetLeftStorageResponse__Output>): grpc.ClientUnaryCall;
  getLeftStorage(argument: _GetLeftStorageRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_GetLeftStorageResponse__Output>): grpc.ClientUnaryCall;
  getLeftStorage(argument: _GetLeftStorageRequest, callback: grpc.requestCallback<_GetLeftStorageResponse__Output>): grpc.ClientUnaryCall;
  
  JoinRoom(argument: _JoinRoomRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_JoinRoomResponse__Output>): grpc.ClientUnaryCall;
  JoinRoom(argument: _JoinRoomRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_JoinRoomResponse__Output>): grpc.ClientUnaryCall;
  JoinRoom(argument: _JoinRoomRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_JoinRoomResponse__Output>): grpc.ClientUnaryCall;
  JoinRoom(argument: _JoinRoomRequest, callback: grpc.requestCallback<_JoinRoomResponse__Output>): grpc.ClientUnaryCall;
  joinRoom(argument: _JoinRoomRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_JoinRoomResponse__Output>): grpc.ClientUnaryCall;
  joinRoom(argument: _JoinRoomRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_JoinRoomResponse__Output>): grpc.ClientUnaryCall;
  joinRoom(argument: _JoinRoomRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_JoinRoomResponse__Output>): grpc.ClientUnaryCall;
  joinRoom(argument: _JoinRoomRequest, callback: grpc.requestCallback<_JoinRoomResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface RoomServiceHandlers extends grpc.UntypedServiceImplementation {
  CreateRoom: grpc.handleUnaryCall<_CreateRoomRequest__Output, _CreateRoomResponse>;
  
  GetJoinedSessions: grpc.handleUnaryCall<_GetJoinedSessionsRequest__Output, _GetJoinedSessionsResponse>;
  
  GetLeftStorage: grpc.handleUnaryCall<_GetLeftStorageRequest__Output, _GetLeftStorageResponse>;
  
  JoinRoom: grpc.handleUnaryCall<_JoinRoomRequest__Output, _JoinRoomResponse>;
  
}

export interface RoomServiceDefinition extends grpc.ServiceDefinition {
  CreateRoom: MethodDefinition<_CreateRoomRequest, _CreateRoomResponse, _CreateRoomRequest__Output, _CreateRoomResponse__Output>
  GetJoinedSessions: MethodDefinition<_GetJoinedSessionsRequest, _GetJoinedSessionsResponse, _GetJoinedSessionsRequest__Output, _GetJoinedSessionsResponse__Output>
  GetLeftStorage: MethodDefinition<_GetLeftStorageRequest, _GetLeftStorageResponse, _GetLeftStorageRequest__Output, _GetLeftStorageResponse__Output>
  JoinRoom: MethodDefinition<_JoinRoomRequest, _JoinRoomResponse, _JoinRoomRequest__Output, _JoinRoomResponse__Output>
}
