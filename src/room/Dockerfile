FROM node:18

RUN mkdir /workspace
RUN apt-get update -y
RUN apt-get install vim -y

COPY src/config.yaml /workspace/config.yaml
COPY src/proto/jcopy.proto /workspace/jcopy.proto
COPY src/room/room.js /workspace/room.js
COPY src/room/package.json /workspace/package.json
COPY src/room/logger.js /workspace/logger.js

WORKDIR /workspace

RUN npm install
ENV NODE_ENV=production

ENTRYPOINT tail -f /dev/null
