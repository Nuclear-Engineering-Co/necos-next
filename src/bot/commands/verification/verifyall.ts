import BaseCommand from "../../util/command.js";
import { PermissionsBitField } from "discord.js";

export default class VerifyAllCommand extends BaseCommand {
  name = "verifyall";
  description =
    "Allows guild administrators to reverify all members of this guild.";
  defaultMemberPermissions = PermissionsBitField.Flags.Administrator;

  cooldown = 120;
  options = [];
}
