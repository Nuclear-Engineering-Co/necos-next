import BaseCommand from "../../../util/command.js";
import { Bot } from "../../../../necos.js";

export default class ReloadCommand extends BaseCommand {
  name = "reload";
  description = "Allows developers to reload individual components of the bot.";

  developer = true;
}
