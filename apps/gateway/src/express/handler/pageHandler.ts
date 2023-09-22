import path from "path";
import { Request, Response } from "express";
import logger from "@config/logger";

const staticPath = (relative_path: string) => path.resolve(process.cwd(), relative_path);

export default function pageHandler(req: Request, res: Response) {
    res.sendFile(staticPath("./build/index2.html"));
}