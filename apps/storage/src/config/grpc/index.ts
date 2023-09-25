import {Server} from "@grpc/grpc-js";

const options = {
    keepCase: true,
    longs: Number,
    defaults: true,
    oneofs: true,
};

const grpcServer = new Server(options);

export default grpcServer;
