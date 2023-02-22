FROM node:18

RUN mkdir /workspace
RUN apt-get update -y
RUN apt-get install vim -y

COPY service/config.yaml /workspace/config.yaml
COPY service/proto/jcopy.proto /workspace/jcopy.proto
COPY service/storage/storage.js /workspace/storage.js
COPY service/storage/package.json /workspace/package.json
COPY service/storage/logger.js /workspace/logger.js

WORKDIR /workspace

RUN npm install
ENV NODE_ENV=production

ENTRYPOINT tail -f /dev/null
