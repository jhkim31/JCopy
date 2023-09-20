import {Server} from "@grpc/grpc-js";

import { StorageService } from "jcopy-shared/proto/jcopy_grpc_pb";
import { createText, getFiles, getText } from "@grpc";

const options = {
    keepCase: true,
    longs: Number,
    defaults: true,
    oneofs: true,
};

const grpcServer = new Server(options);

grpcServer.addService(StorageService, { createText, getFiles, getText });

export default grpcServer;
