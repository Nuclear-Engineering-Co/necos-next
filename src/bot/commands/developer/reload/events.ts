import BaseCommand from "../../../util/command.js";
import { Bot } from "../../../../necos.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors } from "discord.js";
import { config as parseEnv } from "dotenv";

export default class ReloadEverythingSubcommand extends BaseCommand {
  name = "events";
  description = "(DEVELOPER ONLY) Reloads all bot event hooks.";

  developer = true;

  onCommand = async (interaction: ChatInputCommandInteraction<"cached">) => {
    try {
      await this.bot.loadEvents();

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Events reloaded")
            .setDescription(`All events have successfully been reloaded.`)
            .setColor(Colors.Green),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Component Reload failed")
            .setDescription(`One or more events failed to reload. ${error}`)
            .setColor(Colors.Red),
        ],
      });
    }
  };
}
