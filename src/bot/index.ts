/**
 * @name bot/index.ts
 * @description NECos Discord bot entry point
 */

// Imports
import { dirname } from "path";
import { readdirSync, lstatSync } from "fs";
import { NECos, LogLevel } from "../necos.js";
import {
  Client,
  GatewayIntentBits,
  Collection,
  SlashCommandBuilder,
  REST,
  Routes,
  SlashCommandSubcommandBuilder,
  PermissionsBitField,
} from "discord.js";
import type BaseCommand from "./util/command.js";
import { DotenvParseOutput } from "dotenv";

// Constants
const fullPath = dirname(import.meta.url).substring(7);

// Class
const DiscordBot = class Bot extends Client {
  NECos: NECos;
  REST = new REST({ version: "10" });

  commands = new Collection<string, Collection<string, BaseCommand>>();
  environment: DotenvParseOutput = {};
  events: { [name: string]: any } = {};
  util: { [name: string]: any } = {};

  userIdCache: { [username: string]: number } = {};

  constructor(NECos: NECos) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
      ],
    });

    this.NECos = NECos;
    this.environment = NECos.environment;
    NECos.log(LogLevel.INFO, "Beginning discord bot initialization.");

    NECos.log(LogLevel.DEBUG, "Setting REST token.");
    this.REST.setToken(NECos.environment.DISCORD_TOKEN);

    // Load (must be async)
    (async () => {
      NECos.log(LogLevel.DEBUG, "Loading utility files");

      // Load utilities
      await this.loadUtils();

      NECos.log(LogLevel.INFO, "Loading commands...");

      // Load commands
      await this.loadCommands(true);

      NECos.log(LogLevel.INFO, "Hooking in to API events.");

      // Hook events
      await this.loadEvents();

      // Login
      NECos.log(LogLevel.DEBUG, "Logging in.");

      this.login(NECos.environment.DISCORD_TOKEN);

      NECos.log(LogLevel.SUCCESS, "Discord Bot successfully initialized.");
    })();
  }

  loadUtils = async () => {
    const utilFiles = readdirSync(`${fullPath}/util`);
    for (const utilFile of utilFiles) {
      this.NECos.log(LogLevel.DEBUG, `Loading ${utilFile}`);

      const utilFunction = (
        await import(`./util/${utilFile.slice(0, -3)}.js?update=${Date.now()}`)
      ).default;

      this.util[utilFile.slice(0, -3)] = utilFunction.bind(null, this);
    }
  };

  loadCommands = async (push?: boolean) => {
    const commandFiles = readdirSync(`${fullPath}/commands`);
    const commands = [];

    for (const categoryDirectory of commandFiles) {
      this.NECos.log(LogLevel.DEBUG, `Scanning commands/${categoryDirectory}.`);

      const category = new Collection<string, BaseCommand>();
      const commandFiles = readdirSync(
        `${fullPath}/commands/${categoryDirectory}`
      );

      for (const commandFile of commandFiles) {
        this.NECos.log(
          LogLevel.INFO,
          `Loading commands/${categoryDirectory}/${commandFile}`
        );

        const dirStats = lstatSync(
          `${fullPath}/commands/${categoryDirectory}/${commandFile}`
        );
        const isDirectory = dirStats.isDirectory();

        const commandName = isDirectory
          ? commandFile
          : commandFile.slice(0, -3);
        const command: BaseCommand = new (
          await import(
            `./commands/${categoryDirectory}/${commandName}${
              isDirectory ? "/index.js" : ".js"
            }?update=${Date.now()}`
          )
        ).default(this.NECos);

        const slashCommand = new SlashCommandBuilder()
          .setName(command.name)
          .setDescription(command.description)
          .setDefaultMemberPermissions(command.defaultMemberPermissions);

        for (const option of command.options) {
          slashCommand.options.push(option);
        }

        if (isDirectory) {
          const subcommandFiles = readdirSync(
            `${fullPath}/commands/${categoryDirectory}/${commandFile}`
          );

          for (const subcommandFile of subcommandFiles) {
            if (subcommandFile.includes("index")) continue;

            const subcommandName = subcommandFile.slice(0, -3);
            const subcommand: BaseCommand = new (
              await import(
                `./commands/${categoryDirectory}/${commandName}/${subcommandName}.js?update=${Date.now()}`
              )
            ).default(this.NECos);

            const slashCommandSubcommand = new SlashCommandSubcommandBuilder()
              .setName(subcommand.name)
              .setDescription(subcommand.description);

            for (const option of subcommand.options) {
              slashCommandSubcommand.options.push(option);
            }

            slashCommand.addSubcommand(slashCommandSubcommand);
            command.subcommands.push(subcommand);
          }
        }

        category.set(commandName, command);
        commands.push(slashCommand.toJSON());
      }

      this.commands.set(categoryDirectory, category);
    }

    if (push) {
      this.NECos.log(LogLevel.INFO, "Pushing commands to Discord REST API");
      await this.REST.put(
        Routes.applicationCommands(this.NECos.environment.DISCORD_ID),
        { body: commands }
      );
    }
  };

  loadEvents = async () => {
    const eventFiles = readdirSync(`${fullPath}/events`);

    for (const eventFile of eventFiles) {
      const eventName = eventFile.slice(0, -3);
      if (this.events[eventName]) {
        this.removeListener(eventName, this.events[eventName]);

        delete this.events[eventName];
      }

      const eventFunction = (
        await import(`./events/${eventName}.js?update=${Date.now()}`)
      ).default;

      this.events[eventName] = eventFunction.bind(null, this);
      this.on(eventName, this.events[eventName]);

      this.NECos.log(LogLevel.DEBUG, `Bot is now listening for ${eventName}.`);
    }
  };

  makeId = (length = 8): string => {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;

    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }

    return result.toUpperCase();
  };
};

// Exports
export default DiscordBot;
