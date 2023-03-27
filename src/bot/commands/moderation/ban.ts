import BaseCommand from "../../util/command.js";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Colors,
  PermissionsBitField,
} from "discord.js";
import {
  SlashCommandStringOption,
  SlashCommandUserOption,
} from "@discordjs/builders";

export default class BanCommand extends BaseCommand {
  name = "ban";
  description = "Allows guild moderators to ban users. (LOGS)";
  defaultMemberPermissions = PermissionsBitField.Flags.BanMembers;

  options = [
    new SlashCommandUserOption()
      .setName("user")
      .setDescription("The user to ban from the guild.")
      .setRequired(true),

    new SlashCommandStringOption()
      .setName("reason")
      .setDescription("The reason for banning the user.")
      .setRequired(true),
  ];

  onCommand = async (
    interaction: ChatInputCommandInteraction<"cached">
  ): Promise<any> => {
    const member = interaction.options.getMember("user");
    const reason = interaction.options.getString("reason");
    const punishmentId = this.bot.makeId();

    if (!member) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Ban Failed`)
            .setDescription(
              `No member was able to be found. Please ensure you have entered a valid guild member.`
            )
            .setColor(Colors.Red)
            .setFooter({ text: this.bot.environment.APP_NAME })
            .setTimestamp(),
        ],
      });
    }

    if (!reason) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Ban Failed`)
            .setDescription(`You must provide a reason to ban a user.`)
            .setColor(Colors.Red)
            .setFooter({ text: this.bot.environment.APP_NAME })
            .setTimestamp(),
        ],
      });
    }

    if (
      member.roles.highest.position >= interaction.member.roles.highest.position
    ) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Ban Failed`)
            .setDescription(`Insufficient permissions to ban <@${member.id}>.`)
            .setColor(Colors.Red)
            .setFooter({ text: this.bot.environment.APP_NAME })
            .setTimestamp(),
        ],
      });
    }

    // Insert punishment in to database
    try {
    } catch (error) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Ban Failed")
            .setDescription(
              `Punishment log failed to upload to database. ${error}`
            )
            .setColor(Colors.Red)
            .setFooter({ text: this.bot.environment.APP_NAME })
            .setTimestamp(),
        ],
      });
    }

    // DM
    let dmSent = true;

    try {
      await member.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Banned from ${interaction.guild.name}.`)
            .setDescription(
              `You have been banned from ${interaction.guild.name} for: ${reason}\n**Punishment Id:** ${punishmentId}.`
            )
            .setColor(Colors.Red)
            .setFooter({ text: this.bot.environment.APP_NAME })
            .setTimestamp(),
        ],
      });
    } catch (error) {
      dmSent = false;
    }

    try {
      await member.ban({
        reason: reason
      });

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("User Banned")
            .setDescription(
              `<@${member.id}> (${member.user.tag}) has successfully been banned for: ${reason}`
            )
            .setFooter({ text: this.bot.environment.APP_NAME })
            .setTimestamp()
            .setColor(Colors.Green),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("User Ban failed")
            .setDescription(
              `<@${member.id}> (${member.user.tag}) could not be banned. ${error}`
            )
            .setFooter({ text: this.bot.environment.APP_NAME })
            .setTimestamp()
            .setColor(Colors.Red),
        ],
      });
    }
  };
}
