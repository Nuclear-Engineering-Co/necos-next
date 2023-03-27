import { Request, Response } from "express";

export default async (request: Request, response: Response) => {
  return response.send({
    success: true,
    version: "2.0.0",
  });
};
