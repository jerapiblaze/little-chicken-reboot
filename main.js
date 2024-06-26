require("dot-env");
const { Client, Intents } = require('discord.js');
const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_TEST_GUILD_ID, ENVIRONMENT, BACKUP_ENABLE, RESTORE_AT_STARTUP, BACKUP_ON_EXIT, BACKUP_INTERVAL, PORT } = process.env;
global.backupTools = require('./backup-restore.js');
const fs = require('fs');
global.DATA_PATH = `${__dirname}/data`;
global.Moment = require('moment-timezone');

// initialize logger
global.logger = require("pino")({
    transport: {
        targets:[
            { target: 'pino/file', options: { destination: './data/logs/main.log', mkdir:true }},
            { target: 'pino/file', options: { destination: './data/logs/timeline.log', mkdir: true } },
            { target: 'pino-pretty', options: {destination: 1, colorize: (process.env.ENVIRONMENT == 'DEV')}}
        ]
    },
    name: 'main'
});
logger.info(`Little Chicken v3.0 (${ENVIRONMENT})`);

// load executables
global.executables = new Object();
executables.interactionCreate = {
    command: new Map(),
    button: new Map(),
    modalSubmit: new Map()
};
executables.message = {
    messageCreate: new Map(),
    messageDelete: new Map(),
    messageDeleteBulk: new Map(),
    messageUpdate: new Map()
};
executables.messagereaction = {
    messageReactionAdd: new Map(),
    messageReactionRemove: new Map(),
    messageReactionRemoveAll: new Map(),
    messageReactionRemoveEmoji: new Map(),
}
executables.tools = new Map();
const executableFilesList = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
logger.debug(`Found ${executableFilesList.length} file(s)`);

for (executableFilename of executableFilesList){
    logger.trace(`Loading file: ${executableFilename}`)
    executableFile = require(`./commands/${executableFilename}`);
    const executableType = executableFile.commandType.split('/');
    if (!executableType[1]){
        executables[executableType[0]].set(executableFilename.split('.')[0], executableFile);
    } else {
        executables[executableType[0]][executableType[1]].set(executableFilename.split('.')[0], executableFile);
    };
};
logger.info("Loaded executables.")

// backup every exit
async function exitHandler(exitCode, e) {
    if (exitCode == 0) {
        logger.info("EXIT!");
        return 0;
    };
    if (e) {
        logger.error(e);
        logger.error(exitCode);
    } else {
        logger.info(exitCode);
    };
    if (BACKUP_ON_EXIT == 1) {
        await backupTools.backup();
    };
    process.exit(0);
}

process.on('beforeExit', () => exitHandler('beforeExit', null))
process.on('exit', () => exitHandler('exit', null))
process.on('uncaughtException', (err) => exitHandler('uncaughtException', err))
process.on('SIGINT', () => exitHandler('SIGINT', null))
process.on('SIGQUIT', () => exitHandler('SIGQUIT', null))
process.on('SIGTERM', () => exitHandler('SIGTERM', null))

// client initialize
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES], partials:['CHANNEL', 'MESSAGE', 'USER', 'GUILD_MEMBER'] });

// client events handling
client.on('ready', async () => {
    logger.info(`Logged in as ${client.user.tag}!`);

    // backup
    if (BACKUP_ENABLE == 1){
        logger.info(`Auto-backup every ${executables.tools.get('timetools').ms2human(BACKUP_INTERVAL)}!`)
        setInterval(backupTools.backup, BACKUP_INTERVAL);
    };
    // restore
    if (RESTORE_AT_STARTUP == 1){
        await backupTools.restore();
    };

    // load configs
    await executables.tools.get("config_loader").reloadAllKeys();

    logger.info("READY TO GO!");
});

client.on('interactionCreate', async interaction => {
    if (interaction.isButton()){
        const selectedExecutableSet = executables.interactionCreate.button
        if (selectedExecutableSet.has(interaction.customId)) {
            try {
                selectedExecutableSet.get(interaction.customId).execute(interaction);
            } catch (e) {
                logger.error(e);
            }
        }
    };

    if (interaction.isCommand()){
        const selectedExecutableSet = executables.interactionCreate.command
        if (selectedExecutableSet.has(interaction.commandName)){
            try {
                selectedExecutableSet.get(interaction.commandName).execute(interaction);
            } catch (e) {
                logger.error(e);
            }
        }
    };

    if (interaction.isModalSubmit()){
        const selectedExecutableSet = executables.interactionCreate.modalSubmit
        if (selectedExecutableSet.has(interaction.customId)) {
            try {
                selectedExecutableSet.get(interaction.customId).execute(interaction);
            } catch (e) {
                logger.error(e);
            }
        }
    };
});

client.on('messageCreate', async message => {
    const selectedExecutableSet = executables.message.messageCreate
    selectedExecutableSet.forEach(async selectedExecutable => {
        try {
            await selectedExecutable.execute(message);
        } catch (e){
            logger.error(e);
        }
    })
})

client.on('rateLimit', info => logger.warn(info));

client.login(DISCORD_TOKEN).catch(e => {
    logger.error(`Login failed: ${e}`);
});

const express = require('express')
const app = express()
const port = PORT

app.get('/', (req, res) => {
    res.send("hello, I'm Little-Chicken!")
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})