/// <reference path="../../../../types/global.d.ts" />

import { Request, Response } from "express";
import { API } from "../../../necos.js";

export default async (api: API, request: Request, response: Response) => {
  const user = await api
    .database<User>("users")
    .select("*")
    .where({
      user_id: request.params.id,
    })
    .first();

  if (!user) {
    return response.status(404).json({
      success: false,
      status: "ENOUSER",
    });
  }

  user.password = undefined;

  return response.json({ success: true, ...user });
};
