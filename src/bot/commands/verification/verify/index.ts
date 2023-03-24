import BaseCommand from "../../../util/command.js";
import { Bot } from "../../../../necos.js";

export default class VerifyCommand extends BaseCommand {
  name = "verify";
  description = "Allows users to verify ownership of a Roblox account.";
}
