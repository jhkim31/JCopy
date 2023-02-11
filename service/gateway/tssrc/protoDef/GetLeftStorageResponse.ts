// Original file: ../proto/jcopy.proto

import type { Long } from '@grpc/proto-loader';

export interface GetLeftStorageResponse {
  'id'?: (string);
  'roomId'?: (string);
  'leftStorage'?: (number | string | Long);
}

export interface GetLeftStorageResponse__Output {
  'id': (string);
  'roomId': (string);
  'leftStorage': (number);
}
