require('dot-env');
const md5File = require('md5-file');
const { zip, COMPRESSION_LEVEL } = require('zip-a-folder');
const extract = require('extract-zip');
const fs = require('fs');
const logger = require("pino")({
    transport: {
        targets: [
            { target: 'pino/file', options: { destination: './data/logs/backup-restore.log', mkdir: true } },
            { target: 'pino/file', options: { destination: './data/logs/timeline.log', mkdir: true } },
            { target: 'pino-pretty', options: { destination: 1, colorize: true } }
        ]
    },
    name: 'backup-restore'
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
    const filename = `${timestamp}.${hash}.${process.env.environment}.zip`;
    fs.renameSync(`./${tempfilename}`, `./${filename}`);
    logger.trace(`Backup file: ${filename}`);
    
    // upload
    logger.trace(`Uploading...`);
    fs.copyFileSync(`./${filename}`, `./@cloud/${filename}`);
    
    // delete file
    logger.trace(`Cleaning up...`);
    fs.rmSync(`./${filename}`);
    logger.info("Backup completed!");
}

async function restore(){
    logger.info("Starting restore...");
    const filename = `1655028177365.c549ae2c96563a494a954e1a079a5931.DEV.zip`;
    // download file
    logger.trace("Downloading backup file...");
    fs.copyFileSync(`./@cloud/${filename}`, `./${filename}`)
    
    // parse
    logger.info("Parsing data...")
    const parsedFilename = filename.split('.')
    const remoteTimestamp = parsedFilename[0];
    const remoteHash = parsedFilename[1];
    const remoteEnvironment = parsedFilename[2];
    // calc md5
    const environment = process.env.environment;
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
    logger.info("Restore completed");
}

module.exports = {
    backup,
    restore
}