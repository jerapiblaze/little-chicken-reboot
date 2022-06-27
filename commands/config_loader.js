const fs = require('fs');
const { config } = require('process');
var configStore = new Map();

const log = logger.child({ module: "config_loader" });

if (!fs.existsSync(`${DATA_PATH}/server_configs`)) {
    fs.mkdirSync(`${DATA_PATH}/server_configs`);
}

async function reloadAllKeys(keys) {
    var configFileList = keys;
    if (!configFileList) {
        log.info(`Reloading all configs...`);
        configFileList = fs.readdirSync(`${DATA_PATH}/server_configs`).filter(f => f.endsWith('.json'));
    } else {
        log.info(`Reloading ${configFileList.length} configs...`)
    }
    for (configFilename of configFileList) {
        const configFile = fs.readFileSync(`${DATA_PATH}/server_configs/${configFilename}`);
        try {
            const config = JSON.parse(configFile);
            configStore.set(configFilename.split('.')[0], config);
        } catch (e) {
            log.error(e);
        }
    }
}

async function getKey(key) {
    if (!configStore.has(key)) {
        log.warn(`No config found with key ${key}`);
        return null;
    }
    return configStore.get(key);
}

async function writeKey(key, value) {
    if (value){
        configStore.set(key, value);
    }
    fs.writeFileSync(`${DATA_PATH}/server_configs/${key}.json`, JSON.stringify(configStore.get(key)));
}

async function deleteKey(key) {
    if (!configStore.has(key)) {
        log.warn(`No config found with key ${key}`);
        return undefined;
    }
    configStore.delete(key);
    fs.rmSync(`${DATA_PATH}/server_configs/${key}.json`);
}

async function dumpKeys() {
    log.info('Dumping configs to files...');
    for (key of configStore.keys()) {
        fs.writeFileSync(`${DATA_PATH}/server_configs/${key}.json`, JSON.stringify(configStore.get(key)));
    };
    log.info('Dumping configs complete.')
}

async function findConfig(key, subkey, value) {
    if (!configStore.has(key)) {
        return undefined;
    }
    const cS = configStore.get(key);
    for (c of cS) {
        if (c[subkey] == value) {
            return c;
        }
    }
    return undefined;
}

async function writeConfig(key, subkey, value, newEntry) {
    if (configStore.has(key)) {
        const cS = configStore.get(key);
        for (var i = 0; i <= cS.length; i++){
            if (i == cS.length){
                cS.push(newEntry);
            }
            if (!cS[i][subkey]){
                continue;
            }
            if (cS[i][subkey] != value){
                continue;
            }
            cS[i] = newEntry;
            break;
        }
    } else {
       configStore.set(key, [newEntry]);
    }
    await writeKey(key);
    return 0;
}

async function deleteConfig(key, subkey, value) {
    if (!configStore.has(key)) {
        return;
    }
    const cS = configStore.get(key);
    const newcS = cS.filter(c => c[subkey] != value);
    configStore.set(key, newcS);
    await writeKey(key);
    return 0;
}

module.exports = {
    commandType: "tools",
    reloadAllKeys,
    writeKey,
    getKey,
    deleteKey,
    dumpKeys,
    findConfig,
    writeConfig,
    deleteConfig
}