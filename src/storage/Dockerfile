FROM node:18

RUN mkdir /workspace
RUN apt-get update -y
RUN apt-get install vim -y

COPY src/config.yaml /workspace/config.yaml
COPY src/proto/jcopy.proto /workspace/jcopy.proto
COPY src/storage/storage.js /workspace/storage.js
COPY src/storage/package.json /workspace/package.json
COPY src/storage/logger.js /workspace/logger.js

WORKDIR /workspace

RUN npm install
ENV NODE_ENV=production

ENTRYPOINT node storage.js && tail -f /dev/null
