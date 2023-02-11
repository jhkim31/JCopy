// Original file: ../proto/jcopy.proto

import type { Long } from '@grpc/proto-loader';

export interface GetLeftStorageRequest {
  'id'?: (string);
  'roomId'?: (string);
  'size'?: (number | string | Long);
}

export interface GetLeftStorageRequest__Output {
  'id': (string);
  'roomId': (string);
  'size': (number);
}
