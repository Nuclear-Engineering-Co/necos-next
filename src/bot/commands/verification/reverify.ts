import BaseCommand from "../../util/command.js";
import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandUserOption,
} from "discord.js";
import Noblox from "noblox.js";

const { getRankInGroup } = Noblox;

export default class ReverifyCommand extends BaseCommand {
  name = "reverify";
  description =
    "Allows guild moderators to reverify a specific member of this guild.";
  defaultMemberPermissions = PermissionsBitField.Flags.ModerateMembers;

  options = [
    new SlashCommandUserOption()
      .setName("user")
      .setDescription("The user to force-update.")
      .setRequired(true),
  ];

  onCommand = async (interaction: ChatInputCommandInteraction<"cached">) => {
    const member = interaction.options.getMember("user");
    const guild = interaction.guild;

    if (!member) {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${this.bot.environment.APP_NAME} Verification`)
            .setDescription("No guild member was found.")
            .setColor(Colors.Red)
            .setTimestamp()
            .setFooter({
              text: `${this.bot.environment.APP_NAME}`,
            }),
        ],
      });
    }

    const user = await this.database<User>("users")
      .select("*")
      .where("discord_id", member.id)
      .first();

    const roleBinds = await this.database<VerificationRoleBind>(
      "verification_binds"
    )
      .select("*")
      .where({
        guild_id: guild.id,
      });

    if (!user) {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${this.bot.environment.APP_NAME} Verification`)
            .setDescription(`No userdata was found for <@${member.id}>.`)
            .setColor(Colors.Red)
            .setTimestamp()
            .setFooter({
              text: `${this.bot.environment.APP_NAME}`,
            }),
        ],
      });
    }

    if (roleBinds.length == 0) {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${this.bot.environment.APP_NAME} Verification`)
            .setDescription(
              "No bind data was found for this guild. Please contact a guild administrator to resolve this."
            )
            .setColor(Colors.Red)
            .setTimestamp()
            .setFooter({
              text: `${this.bot.environment.APP_NAME}`,
            }),
        ],
      });
    }

    const errors = [];
    const rankCache: { [groupId: number]: number } = {};
    const processedRoles: Array<string> = [];
    const addedRoles: Array<string> = [];
    const removedRoles: Array<string> = [];

    try {
      await member.setNickname(user.username);
    } catch (error) {
      errors.push(`An error occurred whilst setting user nickname. ${error}`);
    }

    for (const roleBind of roleBinds) {
      if (processedRoles.includes(roleBind.role_id)) continue;

      let role = await member.roles.resolve(roleBind.role_id);
      const roleData: RoleData = JSON.parse(roleBind.role_data);
      let shouldHaveRole = false;

      switch (roleData.type) {
        case "group":
          const groupId = roleData.groupId;
          const rankNumber = roleData.rankNumber;

          if (!groupId || !rankNumber) {
            errors.push(
              `Role bind ${roleBind.id} is missing a required property for bind type GROUP. Please contact a guild administrator.`
            );
            break;
          }

          let rankInGroup = 0;

          try {
            rankInGroup =
              rankCache[groupId] ||
              (await getRankInGroup(groupId, parseInt(user.user_id)));
            rankCache[groupId] = rankInGroup;
          } catch (error) {
            errors.push(
              `An error occurred whilst fetching ${user.username}'s rank in group ${groupId}. ${error}`
            );
            break;
          }

          shouldHaveRole = rankInGroup >= rankNumber;
          break;
        case "gamepass":
          const gamepassId = roleData.gamepassId;
          let userOwnsGamepass: any = false;

          if (!gamepassId) {
            errors.push(
              `Role bind ${roleBind.id} is missing a required property for bind type GAMEPASS. Please contact a guild administrator.`
            );
            break;
          }

          try {
            userOwnsGamepass = await fetch(
              `https://inventory.roblox.com/v1/users/62097945/items/1/${gamepassId}/is-owned`
            ).then((res) => res.json());
          } catch (error) {
            errors.push(
              `An error occurred whilst fetching ${user.username}'s ownership of gamepass ${gamepassId}. ${error}`
            );
            break;
          }

          shouldHaveRole = userOwnsGamepass;
      }

      if (role && !shouldHaveRole) {
        try {
          await member.roles.remove(role);
          removedRoles.push(`<@&${role.id}>`);
          processedRoles.push(role.id);
        } catch (error) {
          errors.push(
            `An error occurred whilst removing role <@&${role.id}> from <@${member.id}>. ${error}`
          );
        }
      } else if (!role && shouldHaveRole) {
        role = await guild.roles.resolve(roleBind.role_id);

        if (!role) {
          errors.push(
            `An error occurred whilst fetching role <@&${roleBind.role_id}> from the guild. Please try again later.`
          );
          continue;
        }

        try {
          await member.roles.add(role);
          addedRoles.push(`<@&${role.id}>`);
          processedRoles.push(role.id);
        } catch (error) {
          errors.push(
            `An error occurred whilst removing role <@&${role.id}> from <@${member.id}>. ${error}`
          );
        }
      }
    }

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${this.bot.environment.APP_NAME} Verification`)
          .setDescription(
            `Update for <@${member.id}> complete. ${
              errors.length > 0 ? "Errors:\n" + errors.join("\n") : ""
            }`
          )
          .setColor(errors.length > 0 ? Colors.Orange : Colors.Green)
          .addFields(
            {
              name: "Added Roles",
              value:
                addedRoles.length > 0
                  ? `• ${addedRoles.join("\n •")}`
                  : "None.",
            },

            {
              name: "Removed Roles",
              value:
                removedRoles.length > 0
                  ? `• ${removedRoles.join("\n •")}`
                  : "None.",
            }
          )
          .setTimestamp()
          .setFooter({
            text: `${this.bot.environment.APP_NAME}`,
          }),
      ],
    });
  };
}
