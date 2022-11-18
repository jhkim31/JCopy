FROM node:18

RUN mkdir /workspace
COPY src/config.yaml /workspace/config.yaml
COPY src/proto/jcopy.proto /workspace/jcopy.proto

COPY src/room/room.js /workspace/room.js
COPY src/room/package.json /workspace/package.json

WORKDIR /workspace

RUN npm install

ENTRYPOINT tail -f /dev/null
