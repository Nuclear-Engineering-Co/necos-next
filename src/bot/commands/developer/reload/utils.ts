import BaseCommand from "../../../util/command.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors } from "discord.js";

export default class ReloadEverythingSubcommand extends BaseCommand {
  name = "utils";
  description = "(DEVELOPER ONLY) Reloads all bot utility components.";

  developer = true;

  onCommand = async (interaction: ChatInputCommandInteraction<"cached">) => {
    try {
      await this.bot.loadUtils();

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Utils reloaded")
            .setDescription(
              `All utility components have successfully been reloaded.`
            )
            .setColor(Colors.Green),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Util Reload failed")
            .setDescription(
              `One or more utility components failed to reload. ${error}`
            )
            .setColor(Colors.Red),
        ],
      });
    }
  };
}
