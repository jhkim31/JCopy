// Original file: ../proto/jcopy.proto

import type { Long } from '@grpc/proto-loader';

export interface GetJoinedSessionsResponse {
  'id'?: (string);
  'roomId'?: (string);
  'clientSessions'?: (string)[];
  'leftStorage'?: (number | string | Long);
}

export interface GetJoinedSessionsResponse__Output {
  'id': (string);
  'roomId': (string);
  'clientSessions': (string)[];
  'leftStorage': (number);
}
