FROM node:18

RUN mkdir /workspace
RUN apt-get update -y
RUN apt-get install vim -y

COPY service/config.yaml /workspace/config.yaml
COPY service/proto/jcopy.proto /workspace/jcopy.proto
COPY service/room/room.js /workspace/room.js
COPY service/room/package.json /workspace/package.json
COPY service/room/logger.js /workspace/logger.js

WORKDIR /workspace

RUN npm install
ENV NODE_ENV=production

ENTRYPOINT tail -f /dev/null
