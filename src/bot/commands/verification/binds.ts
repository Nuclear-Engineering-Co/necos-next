import BaseCommand from "../../util/command.js";
import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";

export default class ReverifyCommand extends BaseCommand {
  name = "binds";
  description =
    "Allows guild managers to view the list of rolebinds for this guild.";
  defaultMemberPermissions = PermissionsBitField.Flags.ManageRoles;

  onCommand = async (interaction: ChatInputCommandInteraction<"cached">) => {
    const guild = interaction.guild;
    const bindData = await this.database<VerificationRoleBind>(
      "verification_binds"
    )
      .select("*")
      .where("guild_id", guild.id);

    const binds: Array<string> = [];

    for (const bind of bindData) {
      const roleData = JSON.parse(bind.role_data);
      let roleDataString = "";

      for (const index in roleData) {
        const value = roleData[index];

        roleDataString = roleDataString + `${index}: ${value}\n  `;
      }

      binds.push(`• ${bind.id}
          Role: <@&${bind.role_id}>,
          ${roleDataString}`);
    }

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            `${this.bot.environment.APP_NAME} Rolebinds for ${guild.name}`
          )
          .setDescription(binds.join("\n"))
          .setColor(Colors.Green),
      ],
    });
  };
}
