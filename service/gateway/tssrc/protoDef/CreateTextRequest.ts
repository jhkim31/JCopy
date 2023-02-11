// Original file: ../proto/jcopy.proto

import type { Long } from '@grpc/proto-loader';

export interface CreateTextRequest {
  'id'?: (string);
  'expireTime'?: (number | string | Long);
}

export interface CreateTextRequest__Output {
  'id': (string);
  'expireTime': (number);
}
