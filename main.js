require("dot-env");
const { Client, Intents } = require('discord.js');
const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_TEST_GUILD_ID, ENVIRONMENT, BACKUP_ENABLE, RESTORE_AT_STARTUP, BACKUP_ON_EXIT, BACKUP_INTERVAL } = process.env;
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
logger.info(`Little Chicken v3.0 (${ENVIRONMENT})`);

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

// client events handling
client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);

    // backup
    if (BACKUP_ENABLE == 1){
        setInterval(backupTools.backup, backupInterval);
    };
    // restore
    if (RESTORE_AT_STARTUP == 1){
        backupTools.restore();
    };
    // backup every exit
    async function exitHandler(options, exitCode) {
        if (exitCode == 'exitOk') {
            logger.info("EXIT!");
            return 0;
        };
        if (exitCode == 'uncaughtException') {
            logger.error(exitCode);
        } else {
            logger.info(exitCode);
        };
        if (BACKUP_ON_EXIT == 1) {
            await backupTools.backup();
        };
        process.exit('exitOk');
    }
    [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
        process.on(eventType, exitHandler.bind(null, eventType));
    });
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
client.login(DISCORD_TOKEN).catch(e => {
    logger.error(`Login failed: ${e}`);
});