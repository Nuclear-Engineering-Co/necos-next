import BaseCommand from "../../util/command.js";
import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
} from "discord.js";

export default class VerifyLinkSubcommand extends BaseCommand {
  name = "unlink";
  description = "Allows users to unlink their Roblox account.";

  cooldown = 30;

  onCommand = async (interaction: ChatInputCommandInteraction<"cached">) => {
    const member = interaction.member;
    const channel = interaction.channel;
    const guild = interaction.guild;

    if (!channel) return;

    const existingUser = await this.database<User>("users")
      .select("*")
      .where("discord_id", member.id)
      .first();

    if (!existingUser) {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${this.bot.environment.APP_NAME} Verification`)
            .setDescription("You must be verified first to delete your data.")
            .setColor(Colors.Red),
        ],
      });
    }

    await interaction.editReply({
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Delete my data")
            .setStyle(ButtonStyle.Danger)
            .setCustomId("delete"),

          new ButtonBuilder()
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("cancel")
        ),
      ],

      embeds: [
        new EmbedBuilder()
          .setTitle(`${this.bot.environment.APP_NAME} Verification`)
          .setDescription(
            `Are you **sure** you want to delete all of your ${this.bot.environment.APP_NAME} data?
            **This action cannot be undone.**`
          )
          .setColor(Colors.Red)
          .setTimestamp()
          .setFooter({
            text: `${this.bot.environment.APP_NAME} | Prompt will time out in 60 seconds.`,
          }),
      ],
    });

    const messageComponentCollector =
      await channel.createMessageComponentCollector({
        filter: (interaction) => interaction.member.id === member.id,
        time: 60_000,
        max: 1,
      });

    const deleteData = await new Promise<boolean>((resolve, reject) => {
      messageComponentCollector.on("collect", (collected) => {
        if (collected.customId === "delete") {
          resolve(true);
        } else {
          reject("Prompt cancelled.");
        }
      });

      messageComponentCollector.on("end", (collected) => {
        if (collected.size == 0) {
          reject("Prompt timed out.");
        }
      });
    }).catch(async (response) => {
      return await interaction.editReply({
        components: [],

        embeds: [
          new EmbedBuilder()
            .setTitle(`${this.bot.environment.APP_NAME} Verification`)
            .setDescription(response)
            .setColor(Colors.Red)
            .setTimestamp()
            .setFooter({
              text: this.bot.environment.APP_NAME,
            }),
        ],
      });
    });

    if (deleteData) {
      try {
        await this.database<User>("users")
          .delete("*")
          .where("discord_id", member.id);
        await interaction.editReply({
          components: [],

          embeds: [
            new EmbedBuilder()
              .setTitle(`${this.bot.environment.APP_NAME} Verification`)
              .setDescription(
                `Your ${this.bot.environment.APP_NAME} data has been deleted.`
              )
              .setColor(Colors.Green)
              .setTimestamp()
              .setFooter({
                text: this.bot.environment.APP_NAME,
              }),
          ],
        });
      } catch (error) {
        await interaction.editReply({
          components: [],

          embeds: [
            new EmbedBuilder()
              .setTitle(`${this.bot.environment.APP_NAME} Verification`)
              .setDescription(
                `An unknown error occurred whilst deleting your data. ${error}`
              )
              .setColor(Colors.Red)
              .setTimestamp()
              .setFooter({
                text: this.bot.environment.APP_NAME,
              }),
          ],
        });
      }
    }
  };
}
