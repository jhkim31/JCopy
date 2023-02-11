FROM node:18

RUN mkdir /workspace
RUN apt-get update -y
RUN apt-get install vim -y

COPY service/config.yaml /workspace/config.yaml
COPY service/proto/jcopy.proto /workspace/jcopy.proto

COPY service/gateway/src /workspace/src
COPY service/gateway/build /workspace/build
COPY service/gateway/tssrc /workspace/tssrc

# COPY service/gateway/gateway.js /workspace/gateway.js
COPY service/gateway/package.json /workspace/package.json
# COPY service/gateway/index.html /workspace/index.html
# COPY service/gateway/logger.js /workspace/logger.js
COPY service/gateway/s3.json /workspace/s3.json

WORKDIR /workspace

RUN npm install
RUN tsc

ENV NODE_ENV=production

ENTRYPOINT tail -f /dev/null
