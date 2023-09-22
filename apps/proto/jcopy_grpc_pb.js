// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var jcopy_pb = require('./jcopy_pb.js');

function serialize_jcopy_CreateRoomRequest(arg) {
  if (!(arg instanceof jcopy_pb.CreateRoomRequest)) {
    throw new Error('Expected argument of type jcopy.CreateRoomRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_jcopy_CreateRoomRequest(buffer_arg) {
  return jcopy_pb.CreateRoomRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_jcopy_CreateRoomResponse(arg) {
  if (!(arg instanceof jcopy_pb.CreateRoomResponse)) {
    throw new Error('Expected argument of type jcopy.CreateRoomResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_jcopy_CreateRoomResponse(buffer_arg) {
  return jcopy_pb.CreateRoomResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_jcopy_CreateTextRequest(arg) {
  if (!(arg instanceof jcopy_pb.CreateTextRequest)) {
    throw new Error('Expected argument of type jcopy.CreateTextRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_jcopy_CreateTextRequest(buffer_arg) {
  return jcopy_pb.CreateTextRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_jcopy_CreateTextResponse(arg) {
  if (!(arg instanceof jcopy_pb.CreateTextResponse)) {
    throw new Error('Expected argument of type jcopy.CreateTextResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_jcopy_CreateTextResponse(buffer_arg) {
  return jcopy_pb.CreateTextResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_jcopy_GetFilesRequest(arg) {
  if (!(arg instanceof jcopy_pb.GetFilesRequest)) {
    throw new Error('Expected argument of type jcopy.GetFilesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_jcopy_GetFilesRequest(buffer_arg) {
  return jcopy_pb.GetFilesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_jcopy_GetFilesResponse(arg) {
  if (!(arg instanceof jcopy_pb.GetFilesResponse)) {
    throw new Error('Expected argument of type jcopy.GetFilesResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_jcopy_GetFilesResponse(buffer_arg) {
  return jcopy_pb.GetFilesResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_jcopy_GetJoinedClientIdsRequest(arg) {
  if (!(arg instanceof jcopy_pb.GetJoinedClientIdsRequest)) {
    throw new Error('Expected argument of type jcopy.GetJoinedClientIdsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_jcopy_GetJoinedClientIdsRequest(buffer_arg) {
  return jcopy_pb.GetJoinedClientIdsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_jcopy_GetJoinedClientIdsResponse(arg) {
  if (!(arg instanceof jcopy_pb.GetJoinedClientIdsResponse)) {
    throw new Error('Expected argument of type jcopy.GetJoinedClientIdsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_jcopy_GetJoinedClientIdsResponse(buffer_arg) {
  return jcopy_pb.GetJoinedClientIdsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_jcopy_GetLeftStorageRequest(arg) {
  if (!(arg instanceof jcopy_pb.GetLeftStorageRequest)) {
    throw new Error('Expected argument of type jcopy.GetLeftStorageRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_jcopy_GetLeftStorageRequest(buffer_arg) {
  return jcopy_pb.GetLeftStorageRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_jcopy_GetLeftStorageResponse(arg) {
  if (!(arg instanceof jcopy_pb.GetLeftStorageResponse)) {
    throw new Error('Expected argument of type jcopy.GetLeftStorageResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_jcopy_GetLeftStorageResponse(buffer_arg) {
  return jcopy_pb.GetLeftStorageResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_jcopy_GetTextRequest(arg) {
  if (!(arg instanceof jcopy_pb.GetTextRequest)) {
    throw new Error('Expected argument of type jcopy.GetTextRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_jcopy_GetTextRequest(buffer_arg) {
  return jcopy_pb.GetTextRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_jcopy_GetTextResponse(arg) {
  if (!(arg instanceof jcopy_pb.GetTextResponse)) {
    throw new Error('Expected argument of type jcopy.GetTextResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_jcopy_GetTextResponse(buffer_arg) {
  return jcopy_pb.GetTextResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_jcopy_JoinRoomRequest(arg) {
  if (!(arg instanceof jcopy_pb.JoinRoomRequest)) {
    throw new Error('Expected argument of type jcopy.JoinRoomRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_jcopy_JoinRoomRequest(buffer_arg) {
  return jcopy_pb.JoinRoomRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_jcopy_JoinRoomResponse(arg) {
  if (!(arg instanceof jcopy_pb.JoinRoomResponse)) {
    throw new Error('Expected argument of type jcopy.JoinRoomResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_jcopy_JoinRoomResponse(buffer_arg) {
  return jcopy_pb.JoinRoomResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var RoomService = exports.RoomService = {
  createRoom: {
    path: '/jcopy.Room/CreateRoom',
    requestStream: false,
    responseStream: false,
    requestType: jcopy_pb.CreateRoomRequest,
    responseType: jcopy_pb.CreateRoomResponse,
    requestSerialize: serialize_jcopy_CreateRoomRequest,
    requestDeserialize: deserialize_jcopy_CreateRoomRequest,
    responseSerialize: serialize_jcopy_CreateRoomResponse,
    responseDeserialize: deserialize_jcopy_CreateRoomResponse,
  },
  joinRoom: {
    path: '/jcopy.Room/JoinRoom',
    requestStream: false,
    responseStream: false,
    requestType: jcopy_pb.JoinRoomRequest,
    responseType: jcopy_pb.JoinRoomResponse,
    requestSerialize: serialize_jcopy_JoinRoomRequest,
    requestDeserialize: deserialize_jcopy_JoinRoomRequest,
    responseSerialize: serialize_jcopy_JoinRoomResponse,
    responseDeserialize: deserialize_jcopy_JoinRoomResponse,
  },
  getJoinedClientIds: {
    path: '/jcopy.Room/GetJoinedClientIds',
    requestStream: false,
    responseStream: false,
    requestType: jcopy_pb.GetJoinedClientIdsRequest,
    responseType: jcopy_pb.GetJoinedClientIdsResponse,
    requestSerialize: serialize_jcopy_GetJoinedClientIdsRequest,
    requestDeserialize: deserialize_jcopy_GetJoinedClientIdsRequest,
    responseSerialize: serialize_jcopy_GetJoinedClientIdsResponse,
    responseDeserialize: deserialize_jcopy_GetJoinedClientIdsResponse,
  },
  getLeftStorage: {
    path: '/jcopy.Room/GetLeftStorage',
    requestStream: false,
    responseStream: false,
    requestType: jcopy_pb.GetLeftStorageRequest,
    responseType: jcopy_pb.GetLeftStorageResponse,
    requestSerialize: serialize_jcopy_GetLeftStorageRequest,
    requestDeserialize: deserialize_jcopy_GetLeftStorageRequest,
    responseSerialize: serialize_jcopy_GetLeftStorageResponse,
    responseDeserialize: deserialize_jcopy_GetLeftStorageResponse,
  },
};

exports.RoomClient = grpc.makeGenericClientConstructor(RoomService);
var StorageService = exports.StorageService = {
  createText: {
    path: '/jcopy.Storage/CreateText',
    requestStream: false,
    responseStream: false,
    requestType: jcopy_pb.CreateTextRequest,
    responseType: jcopy_pb.CreateTextResponse,
    requestSerialize: serialize_jcopy_CreateTextRequest,
    requestDeserialize: deserialize_jcopy_CreateTextRequest,
    responseSerialize: serialize_jcopy_CreateTextResponse,
    responseDeserialize: deserialize_jcopy_CreateTextResponse,
  },
  getFiles: {
    path: '/jcopy.Storage/GetFiles',
    requestStream: false,
    responseStream: false,
    requestType: jcopy_pb.GetFilesRequest,
    responseType: jcopy_pb.GetFilesResponse,
    requestSerialize: serialize_jcopy_GetFilesRequest,
    requestDeserialize: deserialize_jcopy_GetFilesRequest,
    responseSerialize: serialize_jcopy_GetFilesResponse,
    responseDeserialize: deserialize_jcopy_GetFilesResponse,
  },
  getText: {
    path: '/jcopy.Storage/GetText',
    requestStream: false,
    responseStream: false,
    requestType: jcopy_pb.GetTextRequest,
    responseType: jcopy_pb.GetTextResponse,
    requestSerialize: serialize_jcopy_GetTextRequest,
    requestDeserialize: deserialize_jcopy_GetTextRequest,
    responseSerialize: serialize_jcopy_GetTextResponse,
    responseDeserialize: deserialize_jcopy_GetTextResponse,
  },
};

exports.StorageClient = grpc.makeGenericClientConstructor(StorageService);
