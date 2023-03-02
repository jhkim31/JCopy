FROM node:18

RUN mkdir /workspace
RUN apt-get update -y
RUN apt-get install vim -y

COPY config.yaml /workspace/config.yaml
COPY proto/jcopy.proto /workspace/jcopy.proto
COPY room/room.js /workspace/room.js
COPY room/package.json /workspace/package.json
COPY room/logger.js /workspace/logger.js

WORKDIR /workspace

RUN npm install
ENV NODE_ENV=production

ENTRYPOINT node room.js
