import BaseCommand from "../../../util/command.js";
import { Bot } from "../../../../necos.js";

export default class MusicCommand extends BaseCommand {
  name = "music";
  description = "Controls this guild's music player.";
}
