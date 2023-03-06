import type { Bot } from "../../necos.js";
import { ChatInputCommandInteraction, Colors, EmbedBuilder } from "discord.js";
import BaseCommand from "./command.js";

export default async (
  bot: Bot,
  interaction: ChatInputCommandInteraction<"cached">
) => {
  await interaction.deferReply();

  const commandName = interaction.commandName;

  let command: BaseCommand | undefined = undefined;

  for (const category of Array.from(bot.commands.values())) {
    for (const com of Array.from(category.values())) {
      if (com.name == commandName) {
        command = com;
        break;
      }
    }

    if (command) break;
  }

  if (!command)
    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Command Execution failed")
          .setDescription(
            `A command matching the name \`${commandName}\` could not be found.`
          )
          .setColor(Colors.Red)
          .setFooter({ text: bot.environment.APP_NAME })
          .setTimestamp()
      ],
    });

  if (command.developer && !bot.environment.APP_DEVELOPERS.includes(interaction.member.id)) {
    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Command Execution failed")
          .setDescription(
            `Only ${bot.environment.APP_NAME} bot developers can execute \`${commandName}\`.`
          )
          .setColor(Colors.Red)
          .setFooter({ text: bot.environment.APP_NAME })
          .setTimestamp()
      ],
    });
  }

  command.onCommand(bot, interaction);
};
