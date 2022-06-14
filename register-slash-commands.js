require('dot-env');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token, globalSlash } = process.env;
const fs = require('fs');
const logger = require("pino")({
    transport: {
        targets: [
            { target: 'pino/file', options: { destination: './data/logs/regCommands.log', mkdir: true } },
            { target: 'pino/file', options: { destination: './data/logs/timeline.log', mkdir: true } },
            { target: 'pino-pretty', options: { destination: 1, colorize: true } }
        ]
    },
    name: 'register-slash-commands'
});

// scan for slash commands
logger.info("Scanning for js file in ./commands")
const filenames = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
logger.info(`Found ${filenames.length} js file(s).`)
const commands = [];

for (var f of filenames) {
    const file = require(`./commands/${f}`);
    if (!file.slashCommandRegInfo) continue;
    logger.info(`Adding ${f.split('.')[0]} to queue...`);
    commands.push(file.slashCommandRegInfo);
}

logger.info(`Added ${commands.length} commands to queue.`)
commands.map(command => command.toJSON());

// upload to Discord
if (guildId.length > 0){
    const guildIds = guildId.split(",");
    for (g of guildIds){
        logger.info(`Registering commands for guild ${g}...`);
        const rest = new REST({ version: '9' }).setToken(token);
        rest.put(Routes.applicationGuildCommands(clientId, g), { body: commands })
            .then(() => logger.info(`Successfully registered application commands for guild ${g}`))
            .catch(e => logger.error(e));
    };
};
if (globalSlash == 1) {
    logger.info(`Registering commands in global...`);
    const rest = new REST({ version: '9' }).setToken(token);
    rest.put(Routes.applicationCommands(clientId), {body: commands})
        .then(() => logger.info(`Successfully registered application commands.`))
        .catch(e => logger.error(e));
}