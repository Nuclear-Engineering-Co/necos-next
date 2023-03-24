import BaseCommand from "../../util/command.js";
import { Bot } from "../../../necos.js";
import { PermissionsBitField } from "discord.js";

export default class ClearQueueCommand extends BaseCommand {
  name = "clearqueue";
  description =
    "Clears the current music queue.";
  defaultMemberPermissions = PermissionsBitField.Flags.ManageChannels;

  options = [];
}
