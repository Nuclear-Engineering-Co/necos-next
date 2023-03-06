/**
 * @name necos.ts
 * @description NECos Entry point
 * @class
 */

// Imports
import { config as parseEnv } from "dotenv";
import DiscordBot from "./bot/index.js";
import chalk from "chalk";

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
  log = (level: string, ...output: string[]) => {
    if (level == LogLevel.DEBUG && this.environment.APP_DEBUG != "true") return;
    console.log(level, ...output);
  };

  bot = new DiscordBot(this);

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

    return true;
  };

  constructor() {
    this.environment.APP_DEVELOPERS = JSON.parse(this.environment.APP_DEVELOPERS)
    //process.on('exit', this.destroy);
    process.on("SIGINT", this.destroy);
  }
};

// Export
const Instance = new NECos();
export type NECos = typeof Instance;
export type Bot = typeof Instance.bot;
export default Instance;
