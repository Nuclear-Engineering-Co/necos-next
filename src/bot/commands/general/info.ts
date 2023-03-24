import BaseCommand from "../../util/command.js";
import { Bot } from "../../../necos.js";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Colors,
  APIApplicationCommandOptionChoice,
} from "discord.js";
import { SlashCommandStringOption } from "@discordjs/builders";
import { readdirSync } from "fs";
import { dirname } from "path";

const commandsPath = dirname(import.meta.url).substring(7);
const commandCategories: Array<APIApplicationCommandOptionChoice<string>> = [];

for (const category of readdirSync(`${commandsPath}/../`)) {
  commandCategories.push({ name: category, value: category });
}

export default class InfoCommand extends BaseCommand {
  name = "info";
  description = "Gives basic bot information.";
  options = [
    new SlashCommandStringOption()
      .setName("category")
      .setDescription("The category of commands")
      .addChoices(...commandCategories)
      .setRequired(false),
  ];

  onCommand = async (
    interaction: ChatInputCommandInteraction<"cached">
  ): Promise<any> => {
    const commands = this.bot.commands;
    const categoryName = interaction.options.getString("category", false);

    const infoEmbed = new EmbedBuilder()
      .setTitle(`${this.bot.environment.APP_NAME} Information`)
      .setDescription(
        `${this.bot.environment.APP_NAME} is ${this.bot.environment.APP_PUBLISHER}'s all-in-one moderation & data management endpoint.`
      )
      .setColor(Colors.Green)
      .setFooter({ text: this.bot.environment.APP_NAME })
      .setTimestamp();

    if (categoryName) {
      const category = commands.get(categoryName);

      if (category && category.size > 0) {
        infoEmbed.addFields([
          {
            name: "Commands",
            value: `• ${Array.from(category.keys()).join("\n• ")}`,
          },
        ]);
      } else {
        infoEmbed.setDescription(
          `No category was found matching the name ${categoryName}.`
        );
      }
    } else {
      infoEmbed.addFields([
        {
          name: "Command Categories",
          value: `• ${Array.from(commands.keys()).join("\n• ")}`,
        },
      ]);
    }

    interaction.editReply({
      embeds: [infoEmbed],
    });
  };
}
