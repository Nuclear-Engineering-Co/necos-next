import BaseCommand from "../../util/command.js";
import { Bot } from "../../../necos.js";
import { PermissionsBitField } from "discord.js";

export default class WhoisCommand extends BaseCommand {
  name = "whois";
  description =
    "Allows guild moderators to look up data for any guild member.";
  defaultMemberPermissions = PermissionsBitField.Flags.ModerateMembers;

  options = [];
}
