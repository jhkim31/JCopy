FROM node:18

RUN mkdir /workspace
RUN apt-get update -y
RUN apt-get install vim -y

COPY config.yaml /workspace/config.yaml
COPY proto/jcopy.proto /workspace/jcopy.proto
COPY storage/storage.js /workspace/storage.js
COPY storage/package.json /workspace/package.json
COPY storage/logger.js /workspace/logger.js

WORKDIR /workspace

RUN npm install
ENV NODE_ENV=production

ENTRYPOINT node storage.js
