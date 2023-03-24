import BaseCommand from "../../../util/command.js";
import { ChatInputCommandInteraction, Colors, EmbedBuilder, Message } from "discord.js";
import Noblox, { PlayerInfo } from "noblox.js";

const { getIdFromUsername, getPlayerInfo } = Noblox;

export default class VerifyNewSubcommand extends BaseCommand {
  name = "link";
  description = "Allows users to link or re-link their Roblox account.";

  cooldown = 30;

  onCommand = async (interaction: ChatInputCommandInteraction<"cached">) => {
    const member = interaction.member;
    const channel = interaction.channel;
    const guild = interaction.guild;

    if (!channel) return;

    const messageCollector = channel.createMessageCollector({
      filter: (interaction) => interaction.member?.id === member.id,
      time: 60_000
    })

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${this.bot.environment.APP_NAME} Verification`)
          .setDescription(`Welcome to ${guild.name}. This guild uses ${this.bot.environment.APP_NAME} verification to ensure the identities of those joining the guild.\n\nTo begin, **Please type your ROBLOX username in this channel.**`)
          .setColor(Colors.Green)
          .setTimestamp()
          .setFooter({
            text: `${this.bot.environment.APP_NAME} | Prompt will time out in 60 seconds.`
          })
      ]
    })

    let username = await new Promise<string>((resolve, reject) => {
      messageCollector.on('collect', (collected: Message) => {
        resolve("");
      })

      messageCollector.on('end', (collected) => {
        if (collected.size == 0) {
          reject("Prompt timed out.")
        }
      })
    })
    .catch(async (response) => {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${this.bot.environment.APP_NAME} Verification`)
            .setDescription(response)
            .setColor(Colors.Red)
            .setTimestamp()
            .setFooter({
              text: this.bot.environment.APP_NAME
            })
        ]
      })
    })

    username = username.toString()

    let userId: number | number[] | undefined = undefined;
    let profileInfo: PlayerInfo | undefined = undefined;

    try {
      userId = await getIdFromUsername(username)
    } catch (error) {
      return await interaction.editReply({
        
      });
    }

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${this.bot.environment.APP_NAME} Verification`)
          .setDescription("Please confirm the information shown corresponds to your player information.")
          .setColor(Colors.Green)
          .setTimestamp()
          .setFooter({
            text: `${this.bot.environment.APP_NAME} | Prompt will time out in 60 seconds.`
          })
          .addFields(
            {
              name: ""
            }
          )
      ]
    })

    let infoConfirmed = await new Promise<boolean>((resolve, reject) => {

    })
  };
}
