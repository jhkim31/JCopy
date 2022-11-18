FROM node:18

RUN mkdir /workspace
COPY src/config.yaml /workspace/config.yaml
COPY src/proto/jcopy.proto /workspace/jcopy.proto

COPY src/gateway/gateway.js /workspace/gateway.js
COPY src/gateway/package.json /workspace/package.json
COPY src/gateway/index.html /workspace/index.html
COPY src/gateway/build /workspace/build

WORKDIR /workspace

RUN npm install

ENTRYPOINT tail -f /dev/null