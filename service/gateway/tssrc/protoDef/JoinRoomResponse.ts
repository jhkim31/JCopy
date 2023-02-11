// Original file: ../proto/jcopy.proto

import type { Long } from '@grpc/proto-loader';

export interface JoinRoomResponse {
  'id'?: (string);
  'result'?: (string);
  'roomId'?: (string);
  'textId'?: (string);
  'fileIds'?: (string)[];
  'expireTime'?: (string);
  'leftStorage'?: (number | string | Long);
}

export interface JoinRoomResponse__Output {
  'id': (string);
  'result': (string);
  'roomId': (string);
  'textId': (string);
  'fileIds': (string)[];
  'expireTime': (string);
  'leftStorage': (number);
}
