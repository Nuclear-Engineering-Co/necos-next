<div align="center">
    <img src="https://cdn.imskyyc.xyz/i/tuuWCq" width="50px" />
    <h1>NECos</h1>
    <a href="https://github.com/Nuclear-Engineering-Co/NECos/actions/workflows/build.yml">
        <img src="https://github.com/Nuclear-Engineering-Co/NECos/actions/workflows/build.yml/badge.svg">
    </a>
    <a href="https://github.com/Nuclear-Engineering-Co/NECos/blob/master/LICENSE">
        <img src="https://img.shields.io/github/license/Nuclear-Engineering-Co/NECos"/>
    </a>
    <a href="https://github.com/Nuclear-Engineering-Co/NECos/releases">
        <img src="https://img.shields.io/github/v/release/Nuclear-Engineering-Co/NECos?label=version"/>
    </a>
    <a href="https://discord.gg/tvfzhfMu4V">
        <img src="https://img.shields.io/discord/966180940827226163?label=discord&logo=discord&logoColor=white"/>
    </a>
    <br />
</div>

<p align="center">NECos is a Discord bot & REST API developed for the Nuclear Engineering Co. (See links below).</p>
<h2> Links </h2>

[NECos Releases](https://github.com/Nuclear-Engineering-Co/NECos/releases) <br />
[Nuclear Engineering Co.](https://www.roblox.com/groups/6380413/Nuclear-Engineering-Co#!/about) <br />
[NECo Discord](https://discord.gg/RbRQwSvF) <br />

<h2> Information</h2>

NECos has a **built-in CLI utility**, via the `necos` script in the root project directory. Run `./necos usage` to get a list of commands. <br />
You can also run the application manually by requiring the `src/necos.ts` file. <br />
<br />

NECos is written in TypeScript, but it also ships with ts-node as a dependency so you're good there. <br />
**However,** NECos **_requires_** npx, _if starting the bot via CLI._ <br />

<h2> Installation </h2>

1. Clone the [NECos](https://github.com/Nuclear-Engineering-Co/NECos-Bun/) repository to whatever directory you'd like. <br />
<code>git clone https://github.com/Nuclear-Engineering-Co/NECos</code>

2. Run `npm install`, or `yarn install`. **PNPM has NOT been tested.** <br />
3. Copy the `.env.example` file to `.env`. **The application will NOT start without valid configuration.** See `configuration` below. <br />

<h2> Configuration </h2>

NECos requires a working database backend. The application uses [Knex](https://knexjs.org/) as a database backend. 

**TODO finish configuration documentation**

<h2> Running the application </h2>

To run NECos, it's as simple as running `./necos start`, and optionally adding the `--debug` flag for extra output messages. (For **all** flags, see `./necos usage')`

Database migration takes place automatically when running the application for the first time.

<h2> Deploying NECos </h2>
Deploying the NECos application is a straightforward process: <br />

1. Run `./necos build` to transpile the TypeScript code in to normal JavaScript. This will output the transpiled code to the `build` directory.

2. It is best to ensure the transpiled version of NECos runs properly before attempting to daemonize or automate. To do so, run `./necos start`. This will start the production version of the application.

3. Daemonize the application however you'd like, either via systemd or your preferred solution. Ensure the "working directory" of the application is wherever you have the application's root folder stored. (The folder containing this README.)
