import BaseCommand from "../../util/command.js";
import { PermissionsBitField, SlashCommandUserOption } from "discord.js";

export default class WhoisCommand extends BaseCommand {
  name = "whois";
  description = "Allows guild moderators to look up data for any guild member.";
  defaultMemberPermissions = PermissionsBitField.Flags.ModerateMembers;

  options = [
    new SlashCommandUserOption()
      .setName("user")
      .setDescription("The user to search for.")
      .setRequired(true),
  ];
}
