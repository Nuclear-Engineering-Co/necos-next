import BaseCommand from "../../../util/command.js";
import { Bot } from "../../../../necos.js";
import { PermissionsBitField } from "discord.js";

export default class BindCommand extends BaseCommand {
  name = "unbind";
  description =
    "Allows guild administrators to unbind Roblox data from the guild.";
  defaultMemberPermissions = PermissionsBitField.Flags.ManageRoles;
}
