import { Request, Response } from "express";

export default function defaultHandler(req: Request, res: Response) {
    res.status(302).redirect("/home");
}