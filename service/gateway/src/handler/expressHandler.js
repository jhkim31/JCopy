"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultHandler = void 0;
var logger_1 = __importDefault(require("../logger"));
var defaultHandler = function (req, res) {
    logger_1.default.info("[1-402-00] ".concat(req.method, " ").concat(req.originalUrl, " ").concat(req.socket.remoteAddress, "  ").concat(JSON.stringify(req.params), " | session-id : ").concat(req.session.id));
    res.sendFile("build/index.html", { root: "." });
};
exports.defaultHandler = defaultHandler;
