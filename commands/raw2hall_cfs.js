const log = logger.child({module: 'raw2hall-cfs'});

async function execute(message){
    if (!message.guildId){
        return 0;
    }
    if (message.author.equals(message.client.user)){
        return 0;
    }
    const pageConfig = await executables.tools.get('config_loader').findConfig(`${message.guildId}_pageSettings`, 'rawChannelID', message.channelId);
    if (!pageConfig){
        return 0;
    }
    await message.client.channels.fetch(pageConfig.hallChannelID).catch(e => log.error(e));

    await message.fetch().catch(e => log.error(e));

    const hallChannel = message.client.channels.cache.get(pageConfig.hallChannelID);

    const blockedWordList = await executables.tools.get('config_loader').findConfig(`${message.guildId}_bannedWords`, '_id', pageConfig._id);
    const blockedState = await executables.tools.get('wordfilter').checkBlocked(message, blockedWordList ? blockedWordList.blockedWords : []);

    if (blockedState.verify) {
        await hallChannel.send({ embeds: message.embeds, components: [executables.tools.get('buttons_cfs').buttonRow_autoDeny(blockedState.word)] });
    } else {
        await hallChannel.send({ embeds: message.embeds, components: [executables.tools.get('buttons_cfs').buttonRow_basic] });
    }

    await message.delete();
}

module.exports = {
    commandType: "message/messageCreate",
    execute
}