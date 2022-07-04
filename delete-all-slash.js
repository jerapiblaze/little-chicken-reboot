'use-strict'
require('dot-env');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_TEST_GUILD_ID, GLOBAL_SLASH } = process.env;

const logger = require("pino")({
    transport: {
        targets: [
            { target: 'pino/file', options: { destination: './data/logs/delCommands.log', mkdir: true } },
            { target: 'pino/file', options: { destination: './data/logs/timeline.log', mkdir: true } },
            { target: 'pino-pretty', options: { destination: 1, colorize: (process.env.ENVIRONMENT == 'DEV') } }
        ]
    },
    name: 'delete-slash-commands'
});

if (DISCORD_TEST_GUILD_ID.length > 0) {
    const guildIds = DISCORD_TEST_GUILD_ID.split(",");
    for (g of guildIds) {
        logger.info(`Deleting commands in guild ${g}...`);
        const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);
        rest.get(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, g))
            .then(data => {
                const promises = [];
                for (const command of data) {
                    const deleteUrl = `${Routes.applicationGuildCommands(DISCORD_CLIENT_ID, g)}/${command.id}`;
                    promises.push(rest.delete(deleteUrl));
                }
                return Promise.all(promises);
            });
    };
};

if (GLOBAL_SLASH != 0) {
    logger.info(`Deleting commands in global...`);
    const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);
    rest.get(Routes.applicationCommands(DISCORD_CLIENT_ID))
        .then(data => {
            const promises = [];
            for (const command of data) {
                const deleteUrl = `${Routes.applicationCommands(clientId)}/${command.id}`;
                promises.push(rest.delete(deleteUrl));
            }
            return Promise.all(promises);
        });
};
