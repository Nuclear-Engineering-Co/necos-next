/**
 * @name necos.ts
 * @description NECos Entry point
 * @class
 */

// Imports
import { config as parseEnv } from "dotenv";
import DiscordBot from "./bot/index.js";
import API from "./api/index.js";
import chalk from "chalk";
import knex from "knex";

// Enum
export const LogLevel = {
  INFO: chalk.gray("[") + chalk.bgBlue.white("INFO") + chalk.gray("]:"),
  WARN: chalk.gray("[") + chalk.bgYellow.white("WARN") + chalk.gray("]:"),
  ERROR: chalk.gray("[") + chalk.redBright.white("ERROR") + chalk.gray("]:"),
  CRITICAL:
    chalk.gray("[") + chalk.bgRedBright.white("SEVERE") + chalk.gray("]:"),
  DEBUG: chalk.gray("[") + chalk.green("DEBUG") + chalk.gray("]:"),
  SUCCESS: chalk.gray("[") + chalk.bgGreen.white("SUCCESS") + chalk.gray("]:"),
};

// Class
const NECos = class NECos {
  environment = parseEnv().parsed || {};
  debug = false;
  start_time = (Date.now() / 1000).toFixed(0);

  database = knex({
    client: this.environment.DB_CONNECTION,
    connection: {
      host: this.environment.DB_HOST,
      port: parseInt(this.environment.DB_PORT),
      database: this.environment.DB_DATABASE,
      user: this.environment.DB_USERNAME,
      password: this.environment.DB_PASSWORD,

      pool: {
        min: 1,
        max: 2,
      },
    },
  });

  log = (level: string, ...output: string[]) => {
    if (level == LogLevel.DEBUG && !this.debug) return;
    console.log(level, ...output);
  };

  bot = new DiscordBot(this);
  api = new API(this);

  destroyed = false;
  destroy = async () => {
    if (this.destroyed) return;

    try {
      await this.bot.destroy();
      this.log(LogLevel.INFO, "Discord bot destroyed.");
    } catch (error) {
      console.log(error);
      this.log(LogLevel.CRITICAL, `Failed to destroy discord bot client.`);
    }

    process.exit(1);
  };

  constructor() {
    this.debug =
      process.argv.includes("--debug") || this.environment.APP_DEBUG == "true";
    this.database.migrate.latest();
    this.environment.APP_DEVELOPERS = JSON.parse(
      this.environment.APP_DEVELOPERS
    );
    //process.on('exit', this.destroy);
    process.on("SIGINT", this.destroy);
  }
};

// Export
const Instance = new NECos();
export type NECos = typeof Instance;
export type Bot = typeof Instance.bot;
export type API = typeof Instance.api;
export default Instance;
