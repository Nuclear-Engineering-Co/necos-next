import type { Bot } from "../../necos.js";
import { inspect } from "util";

export default async (bot: Bot, string: string) => {
  if (string && string.constructor && string.constructor.name == "Promise")
    string = await string;
  if (typeof string !== "string") string = inspect(string, { depth: 1 });

  const environment = bot.environment;

  string = string
    .replace(
      environment.DISCORD_TOKEN,
      "[Content Removed for Security Reasons.]"
    )
    .replace(environment.DB_PASSWORD, "[Content Removed for Security Reasons.]")
    .replace(/`/g, "`" + String.fromCharCode(8203))
    .replace(/@/g, "@" + String.fromCharCode(8203));
  return string;
};
