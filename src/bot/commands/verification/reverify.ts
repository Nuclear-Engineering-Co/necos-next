import BaseCommand from "../../util/command.js";
import { Bot } from "../../../necos.js";
import { PermissionsBitField } from "discord.js";

export default class ReverifyCommand extends BaseCommand {
  name = "reverify";
  description =
    "Allows guild moderators to reverify a specific member of this guild.";
  defaultMemberPermissions = PermissionsBitField.Flags.ModerateMembers;

  options = [];
}
