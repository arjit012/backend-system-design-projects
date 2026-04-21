import type { NextFunction, Request, Response } from "express";

export class HealthCheckController {
  public health = (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json({
        message: "Server is up and running",
      });
    } catch (error) {
      return next(error);
    }
  };
}
