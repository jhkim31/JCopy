FROM node:18

RUN apt update
RUN apt install vim -y

WORKDIR /workspace


COPY apps/gateway /workspace
COPY apps/gateway/build /workspace/build
COPY .env /workspace
COPY shared /workspace/shared

RUN npm install

ENTRYPOINT tail -f /dev/null