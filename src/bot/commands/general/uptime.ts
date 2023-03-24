import BaseCommand from "../../util/command.js";
import { Bot } from "../../../necos.js";
import { ChatInputCommandInteraction, Colors, EmbedBuilder } from "discord.js";

export default class UptimeCommand extends BaseCommand {
  name = "uptime";
  description = "Shows how long the bot / API has been online for.";

  onCommand = async (
    interaction: ChatInputCommandInteraction<"cached">
  ): Promise<any> => {
    const startTime = this.bot.NECos.start_time;

    const uptimeEmbed = new EmbedBuilder()
      .setTitle("Application Uptime")
      .setDescription(
        `• NECos start time: <t:${startTime}:R> (<t:${startTime}>)`
      )
      .setColor(Colors.Green);

    interaction.editReply({
      embeds: [uptimeEmbed],
    });
  };
}
