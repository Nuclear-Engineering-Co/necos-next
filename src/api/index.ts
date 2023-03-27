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
import { Knex } from "knex";

// Constants
const fullPath = dirname(import.meta.url).substring(7);

// Class
const API = class API {
  NECos: NECos;
  database: Knex;
  server = express();
  environment: DotenvParseOutput = {};

  constructor(NECos: NECos) {
    this.NECos = NECos;
    this.environment = NECos.environment;
    this.database = NECos.database;

    NECos.log(LogLevel.INFO, "Beginning REST API initialization.");

    // Default endpoint
    this.server.get("/", (req, res) => {
      res.send({
        success: true,
        status: `${this.environment.APP_NAME} REST API online and ready.`,
        version: "1.0.0",
      });
    });

    (async () => {
      // Load middleware
      const middlewareFiles = readdirSync(`${fullPath}/middleware`);
      for (const middlewareFile of middlewareFiles) {
        const middlewareName = middlewareFile.slice(0, -3);
        const middleware = (
          await import(`./middleware/${middlewareName}.js?update=${Date.now()}`)
        ).default;

        await this.server.use(middleware);
      }

      // Load routes
      const loadRoutes = async (directory: string) => {
        const routeFiles = readdirSync(`${fullPath}/${directory}`);

        for (const routeFile of routeFiles) {
          const dirStats = lstatSync(`${fullPath}/${directory}/${routeFile}`);

          if (dirStats.isDirectory()) {
            loadRoutes(`${directory}/${routeFile}`);
          } else {
            const routeComponents = routeFile.split(".");
            const routeName = routeComponents[0];
            const routeMethod = routeComponents[1];
            const expressFunction = this.server[
              routeMethod as keyof typeof this.server
            ].bind(this.server);

            const route = (
              await import(
                `${fullPath}/${directory}/${routeName}.${routeMethod}.js`
              )
            ).default;

            await expressFunction(
              directory.substring(6) + "/" + routeName,
              route.bind(null, this)
            );
          }
        }
      };

      loadRoutes("routes");

      // Listen for requests
      await this.server.listen(this.environment.API_PORT);

      NECos.log(LogLevel.SUCCESS, "REST API successfully started.");
    })();
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
