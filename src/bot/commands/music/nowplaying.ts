import BaseCommand from "../../util/command.js";
import { Bot } from "../../../necos.js";
import { PermissionsBitField } from "discord.js";

export default class NowPlayingCommand extends BaseCommand {
  name = "nowplaying";
  description =
    "Shows the currently playing song.";

  options = [];
}
