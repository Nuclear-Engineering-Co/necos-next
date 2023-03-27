import { Request, Response } from "express";

export default async (request: Request, response: Response, next: any) => {
  const headers = request.headers;

  console.log(headers);

  if (!headers.authorization) {
    return response.status(401).json({
      success: false,
      status: "Unauthorized.",
    });
  }

  next();
};
