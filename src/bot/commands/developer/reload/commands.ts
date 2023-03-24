import BaseCommand from "../../../util/command.js";
import { Bot } from "../../../../necos.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors, SlashCommandBooleanOption } from "discord.js";
import { config as parseEnv } from "dotenv";

export default class ReloadEverythingSubcommand extends BaseCommand {
  name = "commands";
  description = "(DEVELOPER ONLY) Reloads all bot commands.";

  options = [
    new SlashCommandBooleanOption()
      .setName("push")
      .setDescription("Pushes the commands to the Discord API.")
      .setRequired(false)
  ];

  developer = true;

  onCommand = async (interaction: ChatInputCommandInteraction<"cached">) => {
    const push = interaction.options.getBoolean("push") || false;

    try {
      await this.bot.loadCommands(push);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Commands reloaded")
            .setDescription(`All commands have successfully been reloaded.`)
            .setColor(Colors.Green),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Component Reload failed")
            .setDescription(`Some commands failed to reload. ${error}`)
            .setColor(Colors.Red),
        ],
      });
    }
  };
}
