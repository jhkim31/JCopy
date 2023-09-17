// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var jcopy_pb = require('./jcopy_pb.js');

function serialize_CreateRoomRequest(arg) {
  if (!(arg instanceof jcopy_pb.CreateRoomRequest)) {
    throw new Error('Expected argument of type CreateRoomRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_CreateRoomRequest(buffer_arg) {
  return jcopy_pb.CreateRoomRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_CreateRoomResponse(arg) {
  if (!(arg instanceof jcopy_pb.CreateRoomResponse)) {
    throw new Error('Expected argument of type CreateRoomResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_CreateRoomResponse(buffer_arg) {
  return jcopy_pb.CreateRoomResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_CreateTextRequest(arg) {
  if (!(arg instanceof jcopy_pb.CreateTextRequest)) {
    throw new Error('Expected argument of type CreateTextRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_CreateTextRequest(buffer_arg) {
  return jcopy_pb.CreateTextRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_CreateTextResponse(arg) {
  if (!(arg instanceof jcopy_pb.CreateTextResponse)) {
    throw new Error('Expected argument of type CreateTextResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_CreateTextResponse(buffer_arg) {
  return jcopy_pb.CreateTextResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_GetFilesRequest(arg) {
  if (!(arg instanceof jcopy_pb.GetFilesRequest)) {
    throw new Error('Expected argument of type GetFilesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_GetFilesRequest(buffer_arg) {
  return jcopy_pb.GetFilesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_GetFilesResponse(arg) {
  if (!(arg instanceof jcopy_pb.GetFilesResponse)) {
    throw new Error('Expected argument of type GetFilesResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_GetFilesResponse(buffer_arg) {
  return jcopy_pb.GetFilesResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_GetJoinedSessionsRequest(arg) {
  if (!(arg instanceof jcopy_pb.GetJoinedSessionsRequest)) {
    throw new Error('Expected argument of type GetJoinedSessionsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_GetJoinedSessionsRequest(buffer_arg) {
  return jcopy_pb.GetJoinedSessionsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_GetJoinedSessionsResponse(arg) {
  if (!(arg instanceof jcopy_pb.GetJoinedSessionsResponse)) {
    throw new Error('Expected argument of type GetJoinedSessionsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_GetJoinedSessionsResponse(buffer_arg) {
  return jcopy_pb.GetJoinedSessionsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_GetLeftStorageRequest(arg) {
  if (!(arg instanceof jcopy_pb.GetLeftStorageRequest)) {
    throw new Error('Expected argument of type GetLeftStorageRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_GetLeftStorageRequest(buffer_arg) {
  return jcopy_pb.GetLeftStorageRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_GetLeftStorageResponse(arg) {
  if (!(arg instanceof jcopy_pb.GetLeftStorageResponse)) {
    throw new Error('Expected argument of type GetLeftStorageResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_GetLeftStorageResponse(buffer_arg) {
  return jcopy_pb.GetLeftStorageResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_GetTextRequest(arg) {
  if (!(arg instanceof jcopy_pb.GetTextRequest)) {
    throw new Error('Expected argument of type GetTextRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_GetTextRequest(buffer_arg) {
  return jcopy_pb.GetTextRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_GetTextResponse(arg) {
  if (!(arg instanceof jcopy_pb.GetTextResponse)) {
    throw new Error('Expected argument of type GetTextResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_GetTextResponse(buffer_arg) {
  return jcopy_pb.GetTextResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_JoinRoomRequest(arg) {
  if (!(arg instanceof jcopy_pb.JoinRoomRequest)) {
    throw new Error('Expected argument of type JoinRoomRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_JoinRoomRequest(buffer_arg) {
  return jcopy_pb.JoinRoomRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_JoinRoomResponse(arg) {
  if (!(arg instanceof jcopy_pb.JoinRoomResponse)) {
    throw new Error('Expected argument of type JoinRoomResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_JoinRoomResponse(buffer_arg) {
  return jcopy_pb.JoinRoomResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var RoomServiceService = exports.RoomServiceService = {
  createRoom: {
    path: '/RoomService/CreateRoom',
    requestStream: false,
    responseStream: false,
    requestType: jcopy_pb.CreateRoomRequest,
    responseType: jcopy_pb.CreateRoomResponse,
    requestSerialize: serialize_CreateRoomRequest,
    requestDeserialize: deserialize_CreateRoomRequest,
    responseSerialize: serialize_CreateRoomResponse,
    responseDeserialize: deserialize_CreateRoomResponse,
  },
  joinRoom: {
    path: '/RoomService/JoinRoom',
    requestStream: false,
    responseStream: false,
    requestType: jcopy_pb.JoinRoomRequest,
    responseType: jcopy_pb.JoinRoomResponse,
    requestSerialize: serialize_JoinRoomRequest,
    requestDeserialize: deserialize_JoinRoomRequest,
    responseSerialize: serialize_JoinRoomResponse,
    responseDeserialize: deserialize_JoinRoomResponse,
  },
  getJoinedSessions: {
    path: '/RoomService/GetJoinedSessions',
    requestStream: false,
    responseStream: false,
    requestType: jcopy_pb.GetJoinedSessionsRequest,
    responseType: jcopy_pb.GetJoinedSessionsResponse,
    requestSerialize: serialize_GetJoinedSessionsRequest,
    requestDeserialize: deserialize_GetJoinedSessionsRequest,
    responseSerialize: serialize_GetJoinedSessionsResponse,
    responseDeserialize: deserialize_GetJoinedSessionsResponse,
  },
  getLeftStorage: {
    path: '/RoomService/GetLeftStorage',
    requestStream: false,
    responseStream: false,
    requestType: jcopy_pb.GetLeftStorageRequest,
    responseType: jcopy_pb.GetLeftStorageResponse,
    requestSerialize: serialize_GetLeftStorageRequest,
    requestDeserialize: deserialize_GetLeftStorageRequest,
    responseSerialize: serialize_GetLeftStorageResponse,
    responseDeserialize: deserialize_GetLeftStorageResponse,
  },
};

exports.RoomServiceClient = grpc.makeGenericClientConstructor(RoomServiceService);
var StorageServiceService = exports.StorageServiceService = {
  createText: {
    path: '/StorageService/CreateText',
    requestStream: false,
    responseStream: false,
    requestType: jcopy_pb.CreateTextRequest,
    responseType: jcopy_pb.CreateTextResponse,
    requestSerialize: serialize_CreateTextRequest,
    requestDeserialize: deserialize_CreateTextRequest,
    responseSerialize: serialize_CreateTextResponse,
    responseDeserialize: deserialize_CreateTextResponse,
  },
  getFiles: {
    path: '/StorageService/GetFiles',
    requestStream: false,
    responseStream: false,
    requestType: jcopy_pb.GetFilesRequest,
    responseType: jcopy_pb.GetFilesResponse,
    requestSerialize: serialize_GetFilesRequest,
    requestDeserialize: deserialize_GetFilesRequest,
    responseSerialize: serialize_GetFilesResponse,
    responseDeserialize: deserialize_GetFilesResponse,
  },
  getText: {
    path: '/StorageService/GetText',
    requestStream: false,
    responseStream: false,
    requestType: jcopy_pb.GetTextRequest,
    responseType: jcopy_pb.GetTextResponse,
    requestSerialize: serialize_GetTextRequest,
    requestDeserialize: deserialize_GetTextRequest,
    responseSerialize: serialize_GetTextResponse,
    responseDeserialize: deserialize_GetTextResponse,
  },
};

exports.StorageServiceClient = grpc.makeGenericClientConstructor(StorageServiceService);
