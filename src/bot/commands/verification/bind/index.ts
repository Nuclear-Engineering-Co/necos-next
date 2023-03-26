import BaseCommand from "../../../util/command.js";
import { PermissionsBitField } from "discord.js";

export default class BindCommand extends BaseCommand {
  name = "bind";
  description =
    "Allows guild administrators to bind Roblox data to the guild for users to obtain roles.";
  defaultMemberPermissions = PermissionsBitField.Flags.ManageRoles;
}
