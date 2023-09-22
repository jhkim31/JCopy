import { Request, Response } from "express";

export default function DefaultHandler(req: Request, res: Response) {
    res.status(302).redirect("/home");
}