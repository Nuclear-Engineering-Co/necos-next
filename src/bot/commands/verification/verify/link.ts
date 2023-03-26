import BaseCommand from "../../../util/command.js";
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
import Noblox, { PlayerInfo } from "noblox.js";

const { getBlurb } = Noblox;

export default class VerifyLinkSubcommand extends BaseCommand {
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
      time: 60_000,
      max: 1,
    });

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${this.bot.environment.APP_NAME} Verification`)
          .setDescription(
            `Welcome to ${guild.name}. 
            This guild uses ${this.bot.environment.APP_NAME} verification to ensure the identities of those joining the guild.
            To begin, **Please type your ROBLOX username in this channel.**`
          )
          .setColor(Colors.Green)
          .setTimestamp()
          .setFooter({
            text: `${this.bot.environment.APP_NAME} | Prompt will time out in 60 seconds.`,
          }),
      ],
    });

    let usernameReply: Message | undefined = undefined;
    let username = await new Promise<string>((resolve, reject) => {
      messageCollector.on("collect", async (collected: Message) => {
        usernameReply = await collected.reply(
          "Please confirm the above profile information matches your account."
        );

        messageCollector.stop();

        resolve(collected.content);
      });

      messageCollector.on("end", (collected) => {
        if (collected.size == 0) {
          reject("Prompt timed out.");
        }
      });
    }).catch(async (response) => {
      return await interaction.editReply({
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

    username = username.toString();

    const [profileInfo, userId] = await this.bot.util.getProfileInfo(username)
      .catch(async (error: string) => {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${this.bot.environment.APP_NAME} Verification`)
              .setDescription(error)
              .setColor(Colors.Red)
              .setTimestamp()
              .setFooter({
                text: this.bot.environment.APP_NAME,
              }),
          ],
        });
      });

    const profileInfoConfirmCollector = channel.createMessageComponentCollector(
      {
        filter: (interaction) => interaction.member?.id === member.id,
        time: 60_000,
        max: 1,
      }
    );

    await interaction.editReply({
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Confirm")
            .setCustomId("confirm")
            .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
            .setLabel("Incorrect information")
            .setCustomId("incorrect")
            .setStyle(ButtonStyle.Danger),

          new ButtonBuilder()
            .setLabel("Cancel")
            .setCustomId("cancel")
            .setStyle(ButtonStyle.Secondary)
        ),
      ],
      embeds: [
        new EmbedBuilder()
          .setTitle(`${this.bot.environment.APP_NAME} Verification`)
          .setDescription(
            "Please confirm the information shown corresponds to your player information."
          )
          .setColor(Colors.Green)
          .setTimestamp()
          .setFooter({
            text: `${this.bot.environment.APP_NAME} | Prompt will time out in 60 seconds.`,
          })
          .addFields(
            {
              name: "Username",
              value: profileInfo.username,
              inline: true,
            },
            {
              name: "Display name",
              value: profileInfo.displayName,
              inline: true,
            },
            {
              name: "User Id",
              value: userId.toString(),
              inline: true,
            },
            {
              name: "Blurb / Bio",
              value: `${
                profileInfo.blurb.length > 0 ? profileInfo.blurb : "None."
              }`,
              inline: true,
            },
            {
              name: "Join Date",
              value: profileInfo.joinDate.toString(),
              inline: true,
            }
          ),
      ],
    });

    let infoConfirmed = await new Promise<boolean>((resolve, reject) => {
      profileInfoConfirmCollector.on(
        "collect",
        async (component: ButtonInteraction) => {
          await component.deferUpdate();

          try {
            await usernameReply?.delete()
          } catch (error) {}

          const buttonId = component.customId;

          switch (buttonId) {
            case "confirm":
              resolve(true);
              break;
            case "incorrect":
              reject("Prompt cancelled. Please try again.");
              break;
            case "cancel":
              reject("Prompt cancelled.");
              break;
            default:
              reject("Unknown error.");
          }
        }
      );

      profileInfoConfirmCollector.on("end", (collected) => {
        if (collected.size == 0) {
          reject("Prompt timed out.");
        }
      });
    }).catch(async (response) => {
      return await interaction.editReply({
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

    if (!infoConfirmed) return;

    let codeAddedConfirmed = false;
    let codeAddedCancelled = false;
    let codeAttempts = 0;

    while (!codeAddedConfirmed && codeAttempts < 3 && !codeAddedCancelled) {
      let verificationCodeWords: string[] = [];
      const words = [
        "red",
        "orange",
        "yellow",
        "green",
        "blue",
        "purple",
        "teal",
        "brown",
        "pink",
      ];

      for (let i = 0; i < 8; i++) {
        verificationCodeWords.push(
          words[Math.floor(Math.random() * words.length)]
        );
      }

      let verificationCode = verificationCodeWords.join(" ");

      const codeAddedConfirmCollector = channel.createMessageComponentCollector({
        filter: (interaction) => interaction.member.id === member.id,
        time: 120_000,
        max: 1
      })

      const codeMessage = await channel.send({
        content: `<@${member.id}>, ${codeAttempts > 0 && "I was unable to find the code in the user's blurb / bio," || ""} please enter the following code in your roblox blurb / bio. When you are done, press "Done". \`${verificationCode}\`
        **Times out in 120 seconds.**`,
        components: [
          new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setLabel("Done")
                .setCustomId("true")
                .setStyle(ButtonStyle.Success),
  
              new ButtonBuilder()
                .setLabel("Cancel")
                .setCustomId("false")
                .setStyle(ButtonStyle.Danger),
            )
        ]
      })
  
      codeAddedConfirmed = await new Promise<boolean>((resolve, reject) => {
        codeAddedConfirmCollector.on('collect', async (collected: ButtonInteraction) => {
          const codeAdded = collected.customId === "true"

          try {
            await codeMessage.delete();
          } catch (error) {}
          codeAddedConfirmCollector.stop();
  
          if (codeAdded) {
            const blurb = await getBlurb(userId);
  
            resolve(blurb.includes(verificationCode));
          } else {
            reject("Prompt cancelled.")
          }
        })
  
        codeAddedConfirmCollector.on('end', (collected) => {
          if (collected.size == 0) {
            reject("Prompt timed out.")
          }
        })
      })
      .catch(async (response: string) => {
        codeAddedCancelled = true;

        await interaction.editReply({
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
          ]
        })

        return false;
      })

      codeAttempts++;
    }

    if (codeAddedCancelled) return;

    if (!codeAddedConfirmed) {
      return await interaction.editReply({
        components: [],

        embeds: [
          new EmbedBuilder()
            .setTitle(`${this.bot.environment.APP_NAME} Verification`)
            .setDescription(`Verification code failed to validate after three attempts. Please try again later.`)
            .setColor(Colors.Red)
            .setTimestamp()
            .setFooter({
              text: this.bot.environment.APP_NAME,
            }),
        ]
      })
    }

    try {
      const existingUser = await this.database<User>("users").select("*")
      .where("user_id", userId)
      .first();

      if (existingUser) {
        await this.database<User>("users").update({
          username: username,
          user_id: userId,
          discord_id: member.id,
          updated_at: this.database.fn.now(6)
        })
      } else {
        console.log("creating");
        await this.database<User>("users").insert({
          username: username,
          user_id: userId,
          discord_id: member.id,
        })
      }
    } catch (error) {
      console.log(error);

      return await interaction.editReply({
        components: [],

        embeds: [
          new EmbedBuilder()
            .setTitle(`${this.bot.environment.APP_NAME} Verification`)
            .setDescription(`An error occurred whilst creating userdata in the database. ${error}`)
            .setColor(Colors.Red)
            .setTimestamp()
            .setFooter({
              text: this.bot.environment.APP_NAME,
            }),
        ]
      })
    }

    await interaction.editReply({
      components: [],

      embeds: [
        new EmbedBuilder()
          .setTitle(`${this.bot.environment.APP_NAME} Verification`)
          .setDescription("Discord account verification was successful! Please run \`/verify update\` to obtain roles.")
          .setColor(Colors.Green)
          .setTimestamp()
          .setFooter({
            text: this.bot.environment.APP_NAME,
          }),
      ]
    })
  };
}
