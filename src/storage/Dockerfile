FROM node:18

RUN mkdir /workspace
COPY src/config.yaml /workspace/config.yaml
COPY src/proto/jcopy.proto /workspace/jcopy.proto

COPY src/storage/storage.js /workspace/storage.js
COPY src/storage/package.json /workspace/package.json

WORKDIR /workspace

RUN npm install

ENTRYPOINT tail -f /dev/null
