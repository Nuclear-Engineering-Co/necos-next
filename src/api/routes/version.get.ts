import { API } from "../../necos.js";
import { Request, Response } from "express";

export default async (api: API, request: Request, response: Response) => {
  return response.send({
    success: true,
    version: process.env.npm_package_version,
  });
};
