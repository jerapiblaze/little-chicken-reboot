require('dot-env');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_TEST_GUILD_ID, GLOBAL_SLASH } = process.env;
const fs = require('fs');
global.DATA_PATH = `${__dirname}/data`
global.logger = require("pino")({
    transport: {
        targets: [
            { target: 'pino/file', options: { destination: './data/logs/regCommands.log', mkdir: true } },
            { target: 'pino/file', options: { destination: './data/logs/timeline.log', mkdir: true } },
            { target: 'pino-pretty', options: { destination: 1, colorize: (process.env.ENVIRONMENT == 'DEV') } }
        ]
    },
    name: 'register-slash-commands'
});

// scan for slash commands
const filenames = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
const commands = [];

for (var f of filenames) {
    const file = require(`./commands/${f}`);
    if (!file.slashCommandRegInfo) continue;
    commands.push(file.slashCommandRegInfo);
}

commands.map(command => command.toJSON());

// upload to Discord
if (DISCORD_TEST_GUILD_ID.length > 0){
    const guildIds = DISCORD_TEST_GUILD_ID.split(",");
    for (g of guildIds){
        const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);
        rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, g), { body: commands })
            .then(() => logger.info(`Successfully registered application commands for guild ${g}`))
            .catch(e => logger.error(e));
    };
};
if (GLOBAL_SLASH == 1) {
    const rest = new REST({ version: '9' }).setToken(token);
    rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), {body: commands})
        .then(() => logger.info(`Successfully registered application commands.`))
        .catch(e => logger.error(e));
}