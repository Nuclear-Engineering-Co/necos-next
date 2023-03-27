/// <reference path="../../../../types/global.d.ts" />

import BaseCommand from "../../util/command.js";
import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandUserOption,
} from "discord.js";

export default class WhoisCommand extends BaseCommand {
  name = "whois";
  description = "Allows guild moderators to look up data for any guild member.";
  defaultMemberPermissions = PermissionsBitField.Flags.ModerateMembers;

  options = [
    new SlashCommandUserOption()
      .setName("user")
      .setDescription("The user to search for.")
      .setRequired(true),
  ];

  onCommand = async (interaction: ChatInputCommandInteraction<"cached">) => {
    const guildMember = interaction.options.getMember("user");

    if (!guildMember) {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Whois Lookup failed")
            .setDescription(
              `No member was able to be found. Please ensure you have entered a valid guild member.`
            )
            .setColor(Colors.Red),
        ],
      });
    }

    const user = await this.database<User>("users")
      .select("*")
      .where("discord_id", guildMember.id)
      .first();

    if (!user) {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Whois Lookup failed")
            .setDescription(
              `<@${guildMember.id}> has no ${this.bot.environment.APP_NAME} data.`
            )
            .setColor(Colors.Red),
        ],
      });
    }

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Whois Lookup Results")
          .setDescription(`Information for <@${guildMember.id}>:`)
          .setColor(Colors.Green)
          .addFields(
            {
              name: "Username",
              value: user.username,
              inline: true,
            },

            {
              name: "User Id",
              value: user.user_id,
              inline: true,
            },

            {
              name: `${this.bot.environment.APP_NAME} Role`,
              value: user.role,
              inline: true,
            },

            {
              name: "Verified At",
              value: user.created_at.toString(),
              inline: true,
            },

            {
              name: "Verification Id",
              value: user.id.toString(),
              inline: true,
            }
          ),
      ],
    });
  };
}
