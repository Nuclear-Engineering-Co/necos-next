import BaseCommand from "../../../util/command.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors } from "discord.js";
import { config as parseEnv } from "dotenv";

export default class ReloadEverythingSubcommand extends BaseCommand {
  name = "environment";
  description =
    "(DEVELOPER ONLY) Reloads the application environment variables.";

  developer = true;

  onCommand = async (interaction: ChatInputCommandInteraction<"cached">) => {
    const environment = (await parseEnv().parsed) || {};

    try {
      this.bot.environment = environment;
      this.NECos.environment = environment;

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Environment reloaded")
            .setDescription(
              `The application environment has successfully been reloaded.`
            )
            .setColor(Colors.Green),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Component Reload failed")
            .setDescription(
              `The application environment failed to reload. ${error}`
            )
            .setColor(Colors.Red),
        ],
      });
    }
  };
}
