/// <reference path="../../../../../types/global.d.ts" />

import BaseCommand from "../../../util/command.js";
import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  SlashCommandNumberOption,
  SlashCommandRoleOption,
} from "discord.js";

import Noblox from "noblox.js";

export default class BindGroupSubcommand extends BaseCommand {
  name = "group";
  description = "Allows guild managers to unbind group roles from guild roles.";

  options = [
    new SlashCommandRoleOption()
      .setName("role")
      .setDescription("The guild role to unbind from.")
      .setRequired(true),

    new SlashCommandNumberOption()
      .setName("groupid")
      .setDescription("The group Id of the Roblox group to unbind from.")
      .setRequired(true),

    new SlashCommandNumberOption()
      .setName("rank")
      .setDescription("The numerical rank number to unbind from.")
      .setRequired(true),
  ];

  onCommand = async (interaction: ChatInputCommandInteraction<"cached">) => {
    const options = interaction.options;

    const role = options.getRole("role", true);
    const groupId = options.getNumber("groupid", true);
    const rankNumber = options.getNumber("rank", true);

    const roleData = {
      type: "group",
      groupId: groupId,
      rankNumber: rankNumber,
    };

    const existingRole = await this.database<VerificationRoleBind>(
      "verification_binds"
    )
      .select("*")
      .where({
        guild_id: interaction.guild.id,
        role_id: role.id,
        role_data: JSON.stringify(roleData),
      })
      .first();

    if (!existingRole) {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Rolebind failed to delete")
            .setDescription(
              `A group rolebind for <@&${role.id}> on group ${groupId} at rank ${rankNumber} was not found.`
            )
            .setColor(Colors.Red),
        ],
      });
    }

    this.database<VerificationRoleBind>("verification_binds")
      .delete("*")
      .where({
        guild_id: interaction.guild.id,
        role_id: role.id,
        role_data: JSON.stringify(roleData),
      })
      .then(async () => {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Rolebind deleted")
              .setDescription(
                `Successfully deleted a group rolebind for <@&${role.id}> on group ${groupId} at rank ${rankNumber}.`
              )
              .setColor(Colors.Green),
          ],
        });
      })
      .catch(async (error) => {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Rolebind failed to delete")
              .setDescription(
                `An unexpected error occurred whilst attempting to delete a role bind. ${error}`
              )
              .setColor(Colors.Red),
          ],
        });
      });
  };
}
