import BaseCommand from "../../util/command.js";
import { Bot } from "../../../necos.js";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Colors,
} from "discord.js";
import { SlashCommandStringOption } from "@discordjs/builders";
import { config as parseEnv } from "dotenv";

export default class ReloadCommand extends BaseCommand {
  name = "reload";
  description = "(DEVELOPER ONLY) Reloads components of the bot.";
  developer = true;

  options = [
    new SlashCommandStringOption()
      .setName("component")
      .setDescription("The component of the bot to reload.")
      .addChoices(
        {
          name: "everything",
          value: "everything"
        },

        {
          name: "commands",
          value: "commands",
        },

        {
          name: "utils",
          value: "utils"
        },

        {
          name: "events",
          value: "events"
        },

        {
          name: "environment",
          value: "environment"
        }
      )
      .setRequired(true),
  ];

  onCommand = async (
    bot: Bot,
    interaction: ChatInputCommandInteraction<"cached">
  ): Promise<any> => {
    const component = interaction.options.getString("component", true);
    const environment = parseEnv().parsed || {}

    try {
      switch (component) {
        case "everything":
          await bot.loadUtils();
          await bot.loadCommands();
          await bot.loadEvents();

          bot.NECos.environment = environment
          bot.environment = environment
          
          break;
  
        case "commands":
          await bot.loadCommands()
          break;
  
        case "utils":
          await bot.loadUtils()
          break;
  
        case "events":
          await bot.loadEvents()
          break;

        case "environment":
          bot.NECos.environment = environment
          bot.environment = environment

          break;
      }
  
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Reload Component")
            .setDescription(`Successfully reloaded ${component}.`)
            .setColor(Colors.Green)
        ]
      })
    } catch (error) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Reload Component")
            .setDescription(`Failed to reload ${component}. ${error}`)
            .setColor(Colors.Red)
        ]
      })
    }
  };
}
