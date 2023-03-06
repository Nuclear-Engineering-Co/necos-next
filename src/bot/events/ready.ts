import { LogLevel, Bot } from "../../necos.js";

export default async (bot: Bot) => {
  bot.NECos.log(LogLevel.INFO, "NECos Client logged in.");
  bot.NECos.log(LogLevel.DEBUG, "Setting NECos Client presence.");

  try {
    bot.user?.setPresence({
      activities: [{ name: "necos.dev" }],
      status: "online",
    });
  } catch (error) {
    console.log(error);
    bot.NECos.log(LogLevel.ERROR, `NECos presence was unable to be set.`);
  }
};
