import { LogLevel, Bot } from "../../necos.js";
import { Interaction } from "discord.js";

export default async (bot: Bot, interaction: Interaction) => {
  if (!interaction.inCachedGuild()) return;
  bot.NECos.log(LogLevel.DEBUG, `Interaction recieved!`);

  if (interaction.isChatInputCommand()) {
    bot.util.handleChatInputCommand(interaction);
  }
};
