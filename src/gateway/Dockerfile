FROM node:18

RUN mkdir /workspace
RUN apt-get update -y
RUN apt-get install vim -y

COPY src/config.yaml /workspace/config.yaml
COPY src/proto/jcopy.proto /workspace/jcopy.proto

COPY src/gateway/gateway.js /workspace/gateway.js
COPY src/gateway/package.json /workspace/package.json
COPY src/gateway/index.html /workspace/index.html
COPY src/gateway/build /workspace/build
COPY src/gateway/logger.js /workspace/logger.js
COPY src/gateway/s3.json /workspace/s3.json

WORKDIR /workspace

RUN npm install
ENV NODE_ENV=production

ENTRYPOINT tail -f /dev/null
