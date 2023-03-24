import type { NECos, Bot } from "../../necos.js";
import {
  ApplicationCommandOptionBase,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";

import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import { Knex } from "knex";

export default abstract class BaseCommand {
  bot: Bot;
  NECos: NECos;
  database: Knex;

  name: string = "";
  description: string = "";
  defaultMemberPermissions?: undefined | null | string | number | bigint =
    undefined;

  options: Array<ApplicationCommandOptionBase> = [];
  subcommands: Array<BaseCommand> = [];

  cooldown?: number = undefined;
  developer?: boolean = undefined;

  constructor(NECos: NECos) {
    this.NECos = NECos;
    this.bot = NECos.bot;
    this.database = NECos.database;
  }

  onCommand = async (
    interaction: ChatInputCommandInteraction<"cached">
  ): Promise<any> => {
    throw new Error("Method not implemented.");
  };
}
