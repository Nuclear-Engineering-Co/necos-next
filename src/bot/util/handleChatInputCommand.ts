import type { Bot } from "../../necos.js";
import {
  ChatInputCommandInteraction,
  Collection,
  Colors,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";
import BaseCommand from "./command.js";

const cooldownData = new Collection<string, Collection<string, number>>();

export default async (
  bot: Bot,
  interaction: ChatInputCommandInteraction<"cached">
) => {
  await interaction.deferReply();

  const commandName = interaction.commandName;
  const subcommandName = interaction.options.getSubcommand(false);
  const member = interaction.member;

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
          .setTimestamp(),
      ],
    });

  if (subcommandName) {
    const subcommand = command.subcommands.find(
      (com) => com.name === subcommandName
    );
    if (!subcommand) return;

    subcommand.defaultMemberPermissions = command.defaultMemberPermissions;

    command = subcommand;
  }

  if (
    command.developer &&
    !bot.environment.APP_DEVELOPERS.includes(interaction.member.id)
  ) {
    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Command Execution failed")
          .setDescription(
            `Only ${bot.environment.APP_NAME} bot developers can execute \`${commandName}\`.`
          )
          .setColor(Colors.Red)
          .setFooter({ text: bot.environment.APP_NAME })
          .setTimestamp(),
      ],
    });
  }

  if (
    command.defaultMemberPermissions &&
    typeof command.defaultMemberPermissions == "bigint" &&
    !member.permissions.has(PermissionsBitField.resolve(command.defaultMemberPermissions))
  ) {
    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Command Execution failed")
          .setDescription(
            `Insufficient permissions.`
          )
          .setColor(Colors.Red)
          .setFooter({ text: bot.environment.APP_NAME })
          .setTimestamp(),
      ],
    });
  }

  // if (command.cooldown) {
  //   const userCooldownData = cooldownData.get(member.id) || new Collection<string, number>();
  //   cooldownData.set(member.id, userCooldownData);

  //   const lastExecute = userCooldownData.get(command.name) || 0;
  // }

  try {
    await command.onCommand(interaction);
  } catch (error) {
    console.log(error);

    interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Command Execution failed")
          .setDescription(
            `An error occurred whilst executing command ${commandName}. ${error}`
          )
          .setColor(Colors.Red)
          .setFooter({ text: bot.environment.APP_NAME })
          .setTimestamp(),
      ],
    });
  }
};
