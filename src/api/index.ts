/**
 * @name api/index.ts
 * @description NECos REST API entry point
 */

// Imports
import { dirname } from "path";
import { readdirSync, lstatSync } from "fs";
import { NECos, LogLevel } from "../necos.js";
import { DotenvParseOutput } from "dotenv";
import express from "express";

// Constants
const fullPath = dirname(import.meta.url).substring(7);

// Class
const API = class API {
  NECos: NECos;
  server = express();
  environment: DotenvParseOutput = {}

  constructor(NECos: NECos) {
    this.NECos = NECos;
    this.environment = NECos.environment;

    NECos.log(LogLevel.INFO, "Beginning REST API initialization.");

    this.server.get('/', (req, res) => {
      res.json({ success: true, status: `${this.environment.APP_NAME} REST API online and ready.`, version: "1.0.0" });
    });

    this.server.listen(this.environment.API_PORT);

    NECos.log(LogLevel.SUCCESS, "REST API successfully started.");
  }

  makeId = (length = 8): string => {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;

    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }

    return result.toUpperCase();
  };
};

// Exports
export default API;
