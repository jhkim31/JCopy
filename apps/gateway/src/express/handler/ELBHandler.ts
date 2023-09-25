import path from "path";
import { Request, Response } from "express";
import logger from "@config/logger";

const staticPath = (relative_path: string) => path.resolve(process.cwd(), relative_path);

export default function ELBHandler(req: Request, res: Response) {
    if (req.headers["user-agent"]?.includes("ELB-HealthChecker")) {
        res.send("health check");
        req.session.destroy((e) => {
            logger.error(e);
        });
    } else {                
        res.redirect("/home");
    }
}