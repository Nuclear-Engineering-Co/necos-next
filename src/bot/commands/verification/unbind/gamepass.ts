/// <reference path="../../../../../types/global.d.ts" />

import BaseCommand from "../../../util/command.js";
import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  SlashCommandNumberOption,
  SlashCommandRoleOption,
} from "discord.js";

export default class BindGroupSubcommand extends BaseCommand {
  name = "gamepass";
  description = "Allows guild managers to unbind gamepasses from guild roles.";

  options = [
    new SlashCommandRoleOption()
      .setName("role")
      .setDescription("The guild role to unbind from.")
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

    if (!existingRole) {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Rolebind failed to delete")
            .setDescription(
              `A gamepass rolebind for <@&${role.id}> for gamepass ${gamepassId} was not found.`
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
                `Successfully deleted a gamepass rolebind for <@&${role.id}> for gamepass ${gamepassId}.`
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
                `An unexpected error occurred whilst attempting to delete a role bind. ${error}`
              )
              .setColor(Colors.Red),
          ],
        });
      });
  };
}
