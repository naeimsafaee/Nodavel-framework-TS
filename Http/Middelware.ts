import {NextFunction, Request, Response} from "express";

abstract class Middleware {

    abstract handle(req: Request, res: Response, next: NextFunction): void
}

export default Middleware
