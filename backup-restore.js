require('dot-env');
const md5File = require('md5-file');
const { zip, COMPRESSION_LEVEL } = require('zip-a-folder');
const { Client, Intents, Message, MessageAttachment } = require('discord.js');
const { DISCORD_TOKEN, BACKUP_CHANNEL, BACKUP_ENABLE } = process.env;
const extract = require('extract-zip');
function sleep(time) { return new Promise((resolve) => setTimeout(resolve, time)) };
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { promisify } = require('util');
const logger = require("pino")({
    transport: {
        targets: [
            { target: 'pino/file', options: { destination: './data/logs/backup-restore.log', mkdir: true } },
            { target: 'pino/file', options: { destination: './data/logs/timeline.log', mkdir: true } },
            { target: 'pino-pretty', options: { destination: 1, colorize: (process.env.ENVIRONMENT == 'DEV') } }
        ]
    },
    name: 'backup-restore'
});

if (BACKUP_ENABLE == 0){
    return 0;
}

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES], partials: ['CHANNEL', 'MESSAGE'] });
client.login(DISCORD_TOKEN).catch(e => logger.error(e));
client.on('ready', async () => {
    await client.channels.fetch(BACKUP_CHANNEL);
    logger.info("Backup client ready.");
});

async function backup(){
    logger.info("Starting backup...");
    // name file
    const timestamp = new Date().getTime();
    const tempfilename = `backup.zip`;
    // zip file
    await zip(`./data`, `./${tempfilename}`, { compression: COMPRESSION_LEVEL.high }).catch(e => logger.error(e));
    // calc md5
    const hash = await md5File(`./${tempfilename}`);
    // rename file
    const filename = `${timestamp}.${hash}.${process.env.ENVIRONMENT}.zip`;
    fs.renameSync(`./${tempfilename}`, `./${filename}`);
    logger.trace(`Backup file: ${filename}`);
    
    // upload
    logger.trace(`Uploading...`);
    const attachment = new MessageAttachment(`./${filename}`);
    while (!client.isReady()) {
        logger.warn("Backup client is not ready yet. Waiting for 5 secs...");
        await sleep(5000);
    }
    await client.channels.cache.get(BACKUP_CHANNEL).send({files:[attachment]}).catch(e => logger.error(e));
    
    // delete file
    logger.trace(`Cleaning up...`);
    fs.rmSync(`./${filename}`);
    logger.info("Backup completed!");
}

async function restore(msgid){
    logger.info("Starting restore...");
    while (!client.isReady()){
        logger.warn("Backup client is not ready yet. Waiting for 5 secs...");
        await sleep(5000);
    }

    logger.trace("Fetching backup...");
    const fetchedMessages = await client.channels.cache.get(BACKUP_CHANNEL).messages.fetch(msgid).catch(e => logger.error(e));
    const backupMessage = fetchedMessages.first();
    if (!backupMessage) {
        logger.warn("No backup found!");
        return 0;
    }
    await backupMessage.fetch();
    const filename = backupMessage.attachments.first().name;
    const fileurl = backupMessage.attachments.first().url;
    // download file
    logger.trace("Downloading backup file...");
    
    const writeFilePromise = promisify(fs.writeFile);
    await fetch(fileurl).then(x => x.arrayBuffer()).then(x => writeFilePromise(`./${filename}`, Buffer.from(x)));

    // parse
    logger.trace("Parsing data...")
    const parsedFilename = filename.split('.')
    const remoteTimestamp = parsedFilename[0];
    const remoteHash = parsedFilename[1];
    const remoteEnvironment = parsedFilename[2];
    // calc md5
    const environment = process.env.ENVIRONMENT;
    if (environment != remoteEnvironment) 
        logger.warn(`Different environment! Remote:${remoteEnvironment} Current:${environment}`);
    const hash = await md5File(`./${filename}`);
    if (hash != remoteHash){
        logger.error(`Mismatched hash!`);
    } else {
        logger.trace(`Restoring backup created at ${Date(remoteTimestamp)} ...`);
        await extract(`./${filename}`, { dir: `${__dirname}/data` }).catch(e => logger.error(e));
    }
    // delete file
    logger.trace("Cleaning up...");
    fs.rmSync(`./${filename}`);
    logger.info("Restore completed!");
}

module.exports = {
    backup,
    restore
}