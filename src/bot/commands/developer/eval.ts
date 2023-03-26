import BaseCommand from "../../util/command.js";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Colors,
  SlashCommandStringOption,
} from "discord.js";

export default class ReloadEverythingSubcommand extends BaseCommand {
  name = "eval";
  description = "(DEVELOPER ONLY) Executes raw JavaScript.";

  options = [
    new SlashCommandStringOption()
      .setName("code")
      .setDescription("The code to execute")
      .setRequired(true),
  ];

  developer = true;

  onCommand = async (interaction: ChatInputCommandInteraction<"cached">) => {
    const code = interaction.options.getString("code", true);

    try {
      const evalReturn = eval(code);
      const cleanString = await this.bot.util.cleanString(evalReturn);

      await interaction.editReply({
        content: "Success!",
        files: [
          {
            attachment: Buffer.from(cleanString),
            name: "result.js",
          },
        ],
      });
    } catch (error) {
      await interaction.editReply({
        content: "Code failed to execute",
        files: [
          {
            attachment: Buffer.from(await this.bot.util.cleanString(error)),
            name: "result.js",
          },
        ],
      });
    }
  };
}
