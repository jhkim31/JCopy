import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { RoomServiceClient as _RoomServiceClient, RoomServiceDefinition as _RoomServiceDefinition } from './RoomService';
import type { StorageServiceClient as _StorageServiceClient, StorageServiceDefinition as _StorageServiceDefinition } from './StorageService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  CreateRoomRequest: MessageTypeDefinition
  CreateRoomResponse: MessageTypeDefinition
  CreateTextRequest: MessageTypeDefinition
  CreateTextResponse: MessageTypeDefinition
  Empty: MessageTypeDefinition
  GetFilesRequest: MessageTypeDefinition
  GetFilesResponse: MessageTypeDefinition
  GetJoinedSessionsRequest: MessageTypeDefinition
  GetJoinedSessionsResponse: MessageTypeDefinition
  GetLeftStorageRequest: MessageTypeDefinition
  GetLeftStorageResponse: MessageTypeDefinition
  GetTextRequest: MessageTypeDefinition
  GetTextResponse: MessageTypeDefinition
  JoinRoomRequest: MessageTypeDefinition
  JoinRoomResponse: MessageTypeDefinition
  RoomService: SubtypeConstructor<typeof grpc.Client, _RoomServiceClient> & { service: _RoomServiceDefinition }
  StorageService: SubtypeConstructor<typeof grpc.Client, _StorageServiceClient> & { service: _StorageServiceDefinition }
}

