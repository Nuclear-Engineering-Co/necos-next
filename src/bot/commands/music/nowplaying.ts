import BaseCommand from "../../util/command.js";

export default class NowPlayingCommand extends BaseCommand {
  name = "nowplaying";
  description = "Shows the currently playing song.";

  options = [];
}
