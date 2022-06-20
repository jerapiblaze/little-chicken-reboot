const bulkReRaw2Hall = async (rawChannel) => {
    const missedCfsList = await rawChannel.messages.fetch({ limit: 99, cache: false });
    if (!missedCfsList) {
        return 0;
    }
    for (m of Array.from(missedCfsList.values())){
        await executables.message.messageCreate.get('raw2hall_cfs').execute(m);
    }
}

module.exports = {
    commandType: "tools",
    bulkReRaw2Hall
}