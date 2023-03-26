/// <reference path="../../../../../types/global.d.ts" />

import BaseCommand from "../../../util/command.js";
import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  SlashCommandNumberOption,
  SlashCommandRoleOption,
} from "discord.js";

import fetch from "node-fetch";

export default class BindGroupSubcommand extends BaseCommand {
  name = "gamepass";
  description = "Allows guild managers to bind gamepasses to guild roles.";

  options = [
    new SlashCommandRoleOption()
      .setName("role")
      .setDescription("The guild role to bind to.")
      .setRequired(true),

    new SlashCommandNumberOption()
      .setName("gamepass")
      .setDescription("The Id of the gamepass.")
      .setRequired(true),
  ];

  onCommand = async (interaction: ChatInputCommandInteraction<"cached">) => {
    const options = interaction.options;

    const role = options.getRole("role", true);
    const gamepassId = options.getNumber("gamepass", true);

    let gamepassData = undefined;

    try {
      gamepassData = fetch(
        `https://apis.roblox.com/game-passes/v1/game-passes/${gamepassId}/product-info`
      ).then((res) => res.json());
    } catch (error) {
      console.log(error);
      console.log(
        `Gamepass fetch error matching interaction ${interaction.id}.`
      );
    }

    if (!gamepassData) {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Rolebind failed")
            .setDescription(
              `No gamepass was found matching Id ${gamepassId}, or an error occurred.`
            )
            .setColor(Colors.Red),
        ],
      });
    }

    const roleData = {
      type: "gamepass",
      gamepassId: gamepassId,
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

    if (existingRole) {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Rolebind failed to create")
            .setDescription(
              `A gamepass rolebind for <@&${role.id}> for gamepass ${gamepassId} already exists.`
            )
            .setColor(Colors.Red),
        ],
      });
    }

    this.database<VerificationRoleBind>("verification_binds")
      .insert({
        guild_id: interaction.guild.id,
        role_id: role.id,
        role_data: JSON.stringify(roleData),
      })
      .then(async () => {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Rolebind created")
              .setDescription(
                `Successfully created a gamepass rolebind for <@&${role.id}> for gamepass ${gamepassId}.`
              )
              .setColor(Colors.Green),
          ],
        });
      })
      .catch(async (error) => {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Rolebind failed to create")
              .setDescription(
                `An unexpected error occurred whilst attempting to create a role bind. ${error}`
              )
              .setColor(Colors.Red),
          ],
        });
      });
  };
}
