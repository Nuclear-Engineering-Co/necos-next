import type { Bot } from "../../necos.js";

export default async (bot: Bot, ...args: any[]) => {
  console.log("hello from the bot!");
  console.log("necos class is at: ", bot.NECos);
  console.log(...args);
};
