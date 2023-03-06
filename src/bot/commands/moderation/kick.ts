import BaseCommand from "../../util/command.js";
import { Bot } from "../../../necos.js";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Colors,
  APIApplicationCommandOptionChoice,
} from "discord.js";
import { SlashCommandStringOption, SlashCommandUserOption } from "@discordjs/builders";


export default class KickCommand extends BaseCommand {
  name = "kick";
  description = "Allows guild moderators to kick users. (LOGS)";
  options = [
    new SlashCommandUserOption()
      .setName("user")
      .setDescription("The user to kick from the guild.")
      .setRequired(true),

    new SlashCommandStringOption()
      .setName("reason")
      .setDescription("The reason for kicking the user.")
      .setRequired(true)
  ];

  onCommand = async (
    bot: Bot,
    interaction: ChatInputCommandInteraction<"cached">
  ): Promise<any> => {
    const member = interaction.options.getMember("user");
    const reason = interaction.options.getString("reason");
    const punishmentId = bot.makeId();

    if (!member) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setTitle(`Kick Failed`)
          .setDescription(`No member was able to be found. Please ensure you have entered a valid guild member.`)
          .setColor(Colors.Red)
          .setFooter({ text: bot.environment.APP_NAME })
          .setTimestamp()
        ]
      })
    }

    if (!reason) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setTitle(`Kick Failed`)
          .setDescription(`You must provide a reason to kick a user.`)
          .setColor(Colors.Red)
          .setFooter({ text: bot.environment.APP_NAME })
          .setTimestamp()
        ]
      })
    }

    if (member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Kick Failed`)
            .setDescription(`Insufficient permissions to kick <@${member.id}>.`)
            .setColor(Colors.Red)
            .setFooter({ text: bot.environment.APP_NAME })
            .setTimestamp()
        ]
      })
    }

    // Insert punishment in to database
    try {
      
    } catch (error) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Kick Failed")
            .setDescription(`Punishment log failed to upload to database. ${error}`)
            .setColor(Colors.Red)
            .setFooter({ text: bot.environment.APP_NAME })
            .setTimestamp()
        ]
      });
    }

    // DM
    let dmSent = true;
    
    try {
      await member.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Kicked from ${interaction.guild.name}.`)
            .setDescription(`You have been kicked from ${interaction.guild.name} for: ${reason}\n**Punishment Id:** ${punishmentId}.`)
            .setColor(Colors.Red)
            .setFooter({ text: bot.environment.APP_NAME })
            .setTimestamp()
        ]
      })
    } catch (error) {
      dmSent = false
    }

    try {
      await member.kick(reason);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("User Kicked")
            .setDescription(`<@${member.id}> (${member.user.tag}) has successfully been kicked for: ${reason}`)
            .setFooter({ text: bot.environment.APP_NAME })
            .setTimestamp()
            .setColor(Colors.Green)
        ]
      })
    } catch (error) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("User Kick failed")
            .setDescription(`<@${member.id}> (${member.user.tag}) could not be kicked. ${error}`)
            .setFooter({ text: bot.environment.APP_NAME })
            .setTimestamp()
            .setColor(Colors.Red)
        ]
      })
    }
  };
}
