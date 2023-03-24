/// <reference path="../../../../../types/global.d.ts" />

import BaseCommand from "../../../util/command.js";
import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandNumberOption, SlashCommandRoleOption } from "discord.js";

import Noblox, { Role } from "noblox.js";
const { getRole } = Noblox;

export default class BindGroupSubcommand extends BaseCommand {
  name = "group";
  description = "Allows guild members to bind group roles to guild roles.";

  options = [
    new SlashCommandRoleOption()
      .setName("role")
      .setDescription("The guild role to bind to.")
      .setRequired(true),

    new SlashCommandNumberOption()
      .setName("groupid")
      .setDescription("The group Id of the Roblox group to bind to.")
      .setRequired(true),

    new SlashCommandNumberOption()
      .setName("rank")
      .setDescription("The numerical rank number to bind to.")
      .setRequired(true)
  ];

  onCommand = async (interaction: ChatInputCommandInteraction<"cached">) => {
    const options = interaction.options;

    const role = options.getRole("role", true);
    const groupId = options.getNumber("groupid", true);
    const rankNumber = options.getNumber("rank", true);

    let apiRoleData: Role | undefined = undefined;

    try {
      apiRoleData = await getRole(groupId, rankNumber)
    } catch (error) {
      apiRoleData = {
        name: "Unknown",
        memberCount: -1,
        rank: -1,
        id: -1,
      }

      console.log(error);
      console.log(`Role fetch error matching interaction ${interaction.id}.`)
    }

    if (!apiRoleData || apiRoleData.id == -1) {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Rolebind failed")
            .setDescription(`No role was found at rank ${rankNumber} for group ${groupId}, or an error occurred.`)
            .setColor(Colors.Red)
        ]
      })
    }

    const roleData = {
      type: "group",
      groupId: groupId,
      rankNumber: rankNumber
    }

    const existingRole = await this.database<VerificationRoleBind>("verification_binds")
      .select("*")
      .where({
        guild_id: interaction.guild.id,
        role_id: role.id,
        role_data: JSON.stringify(roleData)
      })
      .first()

    if (existingRole) {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Rolebind failed to create")
            .setDescription(`A group rolebind for <@&${role.id}> on group ${groupId} at rank ${rankNumber} already exists.`)
            .setColor(Colors.Red)
        ]
      })
    }

    this.database<VerificationRoleBind>("verification_binds").insert({
      guild_id: interaction.guild.id,
      role_id: role.id,
      role_data: JSON.stringify(roleData)
    })
    .then(async () => {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Rolebind created")
            .setDescription(`Successfully created a group rolebind for <@&${role.id}> on group ${groupId} at rank ${rankNumber}.`)
            .setColor(Colors.Green)
        ]
      })
    })
    .catch(async (error) => {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Rolebind failed to create")
            .setDescription(`An unexpected error occurred whilst attempting to create a role bind. ${error}`)
            .setColor(Colors.Red)
        ]
      })
    })
  };
}
