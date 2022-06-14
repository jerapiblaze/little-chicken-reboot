'use-strict'
require('dot-env');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token, globalSlash } = process.env;

const logger = require("pino")({
    transport: {
        targets: [
            { target: 'pino/file', options: { destination: './data/logs/delCommands.log', mkdir: true } },
            { target: 'pino/file', options: { destination: './data/logs/timeline.log', mkdir: true } },
            { target: 'pino-pretty', options: { destination: 1, colorize: true } }
        ]
    },
    name: 'delete-slash-commands'
});

if (guildId.length > 0) {
    const guildIds = guildId.split(",");
    for (g of guildIds) {
        logger.info(`Deleting commands in guild ${g}...`);
        const rest = new REST({ version: '9' }).setToken(token);
        rest.get(Routes.applicationGuildCommands(clientId, guildId))
            .then(data => {
                const promises = [];
                for (const command of data) {
                    const deleteUrl = `${Routes.applicationGuildCommands(clientId, guildId)}/${command.id}`;
                    promises.push(rest.delete(deleteUrl));
                }
                return Promise.all(promises);
            });
    };
};

if (globalSlash != 0) {
    logger.info(`Deleting commands in global...`);
    const rest = new REST({ version: '9' }).setToken(token);
    rest.get(Routes.applicationCommands(clientId, guildId))
        .then(data => {
            const promises = [];
            for (const command of data) {
                const deleteUrl = `${Routes.applicationCommands(clientId)}/${command.id}`;
                promises.push(rest.delete(deleteUrl));
            }
            return Promise.all(promises);
        });
};
