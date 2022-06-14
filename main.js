require("dot-env");
const { Client, Intents } = require('discord.js');
const { token, enableBackup, restoreAtStartup, backupInterval, backupOnExit } = process.env;
const backupTools = require('./backup-restore.js');
const fs = require('fs');

// initialize logger
global.logger = require("pino")({
    transport: {
        targets:[
            { target: 'pino/file', options: { destination: './data/logs/main.log', mkdir:true }},
            { target: 'pino/file', options: { destination: './data/logs/timeline.log', mkdir: true } },
            { target: 'pino-pretty', options: {destination: 1, colorize:true}}
        ]
    },
    name: 'main'
});

// load executables
logger.info("Scanning for executables...");
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
executables.ultils = new Map();
const executableFilesList = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
logger.debug(`Found ${executableFilesList.length} file(s)`);

for (executableFilename of executableFilesList){
    logger.trace(`Loading file: ${executableFilename}`)
    executableFile = require(`./commands/${executableFilename}`);
    const executableType = executableFile.commandType.split('/');
    if (!executableType[1]){
        executables[executableType[0]].set(executableFilename.split('.')[0], executableFile.execute)
    } else {
        executables[executableType[0]][executableType[1]].set(executableFilename.split('.')[0], executableFile.execute);
    };
};

logger.info("Loaded executables.")

// client initialize
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES], partials:['CHANNEL', 'MESSAGE', 'USER', 'GUILD_MEMBER'] });

// backup every exit
async function exitHandler(options, exitCode) {
    if (exitCode == 'exitOk') {
        logger.info("EXIT!");
        return 0;
    };
    if (exitCode == 'uncaughtException'){
        logger.error(exitCode);
    } else {
        logger.info(exitCode);
    };
    if (backupOnExit == 1){
        await backupTools.backup();
    };
    process.exit('exitOk');
}

[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
    process.on(eventType, exitHandler.bind(null, eventType));
})

// client events handling
client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);
    if (enableBackup == 1){
        setInterval(backupTools.backup, backupInterval);
    };
    if (restoreAtStartup == 1){
        backupTools.restore();
    };
});

client.on('interactionCreate', async interaction => {
    if (interaction.isButton()){
        const selectedExecutableSet = executables.interactionCreate.button
        if (selectedExecutableSet.has(interaction.customId)) {
            try {
                selectedExecutableSet.get(interaction.customId)(interaction);
            } catch (e) {
                logger.error(e);
            }
        }
    };

    if (interaction.isCommand()){
        const selectedExecutableSet = executables.interactionCreate.command
        if (selectedExecutableSet.has(interaction.commandName)){
            try {
                selectedExecutableSet.get(interaction.commandName)(interaction);
            } catch (e) {
                logger.error(e);
            }
        }
    };

    if (interaction.isModalSubmit()){
        const selectedExecutableSet = executables.interactionCreate.modalSubmit
        if (selectedExecutableSet.has(interaction.customId)) {
            try {
                selectedExecutableSet.get(interaction.customId)(interaction);
            } catch (e) {
                logger.error(e);
            }
        }
    };
});

client.on('messageCreate', async message => {
    const selectedExecutableSet = executables.message.messageCreate
    selectedExecutableSet.forEach(async exec => {
        try {
            exec(message)
        } catch (e){
            logger.error(e);
        }
    })
})

client.on('rateLimit', info => logger.warn(info));

logger.info("Logging in...");
client.login(token).catch(e => {
    logger.error(`Login failed: ${e}`);
});