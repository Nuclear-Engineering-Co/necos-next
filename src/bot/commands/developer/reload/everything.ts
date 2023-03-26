import BaseCommand from "../../../util/command.js";
import { ChatInputCommandInteraction, EmbedBuilder, Colors } from "discord.js";
import { config as parseEnv } from "dotenv";

export default class ReloadEverythingSubcommand extends BaseCommand {
  name = "everything";
  description = "(DEVELOPER ONLY) Reloads all bot components.";

  developer = true;

  onCommand = async (interaction: ChatInputCommandInteraction<"cached">) => {
    const environment = (await parseEnv().parsed) || {};

    try {
      this.bot.environment = environment;
      this.NECos.environment = environment;

      await this.bot.loadUtils();
      await this.bot.loadCommands();
      await this.bot.loadEvents();

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("All components reloaded")
            .setDescription(`All components have successfully been reloaded.`)
            .setColor(Colors.Green),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Component Reload failed")
            .setDescription(`One or more components failed to reload. ${error}`)
            .setColor(Colors.Red),
        ],
      });
    }
  };
}
