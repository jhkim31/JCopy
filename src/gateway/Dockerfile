FROM node:18

RUN mkdir /workspace
RUN apt-get update -y
RUN apt-get install vim -y

COPY config.yaml /workspace/config.yaml

COPY gateway/build /workspace/build
COPY proto/jcopy.proto /workspace/jcopy.proto
COPY gateway/gateway.js /workspace/gateway.js
COPY gateway/package.json /workspace/package.json
COPY gateway/logger.js /workspace/logger.js
COPY gateway/s3.json /workspace/s3.json

WORKDIR /workspace

RUN npm install

ENV NODE_ENV=production

ENTRYPOINT node gateway.js
