const fs = require('fs');
var configStore = new Map();

const log = logger.child({module: "config_loader"});

if (!fs.existsSync(`${DATA_PATH}/server_configs`)){
    fs.mkdirSync(`${DATA_PATH}/server_configs`);
}

async function reloadConfigs(keys){
    var configFileList = keys;
    if (!configFileList){
        log.info(`Reloading all configs...`);
        configFileList = fs.readdirSync(`${DATA_PATH}/server_configs`).filter(f => f.endsWith('.json'));
    } else {
        log.info(`Reloading ${configFileList.length} configs...`)
    }
    for (configFilename of configFileList){
        const configFile = fs.readFileSync(`${DATA_PATH}/server_configs/${configFilename}`);
        try {
            const config = JSON.parse(configFile);
            configStore.set(configFilename.split('.')[0], config);
        } catch (e){
            log.error(e);
        }
    }
}

async function getConfig(key){
    if (!configStore.has(key)){
        log.warn(`No config found with key ${key}`);
        return null;
    }
    return configStore.get(key);
}

async function writeConfig(key, value){
    configStore.set(key, value);
    fs.writeFileSync(`.${DATA_PATH}/server_configs/${key}.json`, configStore.get(key));
}

async function deleteConfig(key){
    if (!configStore.has(key)) {
        log.warn(`No config found with key ${key}`);
        return null;
    }
    configStore.delete(key);
    fs.rmSync(`${DATA_PATH}/server_configs/${key}.json`);
}

async function dumpConfigs(){
    log.info('Dumping configs to files...');
    for (key of configStore.keys()){
        fs.writeFileSync(`${DATA_PATH}/server_configs/${key}.json`, JSON.stringify(configStore.get(key)));
    };
    log.info('Dumping configs complete.')
}

module.exports = {
    commandType: "tools",
    //slashCommandRegInfo,
    reloadConfigs,
    getConfig,
    writeConfig,
    deleteConfig,
    dumpConfigs
}