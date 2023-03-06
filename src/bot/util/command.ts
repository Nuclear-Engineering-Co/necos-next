import type { NECos, Bot } from "../../necos.js";
import {
  ApplicationCommandOptionBase,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";

import { ChatInputCommandInteraction } from "discord.js";

export default abstract class BaseCommand {
  bot: Bot;
  NECos: NECos;

  name: string = "";
  description: string = "";
  defaultMemberPermissions: undefined | null | string | number | bigint = null;

  options: Array<ApplicationCommandOptionBase> = [];
  subcommands: Array<SlashCommandSubcommandBuilder> = [];

  cooldown: number | null = null;
  developer: boolean | null = null;

  constructor(NECos: NECos) {
    this.NECos = NECos;
    this.bot = NECos.bot;
  }

  onCommand = async (
    bot: Bot,
    interaction: ChatInputCommandInteraction<"cached">
  ): Promise<any> => {
    throw new Error("Method not implemented.");
  };
}
