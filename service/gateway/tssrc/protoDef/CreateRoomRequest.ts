// Original file: ../proto/jcopy.proto

import type { Long } from '@grpc/proto-loader';

export interface CreateRoomRequest {
  'id'?: (string);
  'clientSession'?: (string);
  'expireTime'?: (number | string | Long);
  'num'?: (number | string | Long);
}

export interface CreateRoomRequest__Output {
  'id': (string);
  'clientSession': (string);
  'expireTime': (number);
  'num': (number);
}
