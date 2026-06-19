import { NextFunction, Request, Response } from "express";

export const errorMiddleware = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {

  if (error.issues) {

    return res.status(400).json({
      success: false,
      message: error.issues[0].message,
    });

  }

  if (error.statusCode) {

    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

  }

  return res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  });

};