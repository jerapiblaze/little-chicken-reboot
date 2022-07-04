const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const configTypeNames = ['adminMask', 'bannedWords', 'pageCount', 'pageSettings', 'pageTags'];

async function execute(message) {
    if (message.inGuild()){
        return 0;
    }

    if (message.content != '/import'){
        return 0;
    }

    const messageAttachments = Array.from(message.attachments.values());

    if (messageAttachments.length == 0){
        message.reply("No file to import!");
        return 0;
    }

    for (attachment of messageAttachments){
        const filename = attachment.name;
        const parsedName = filename.split('.')[0].split('_');
        const targetGuild = await message.client.guilds.fetch(parsedName[0]).catch(e => {
            message.reply(`**Failed to fetch target guild!**\n(filename: ${filename})\n${e}`);
        });

        if (!targetGuild){
            continue;
        }

        const thisMemberInGuild = await targetGuild.members.fetch(message.author.id).catch(e => {
            message.reply(`**Failed to get your info in the target guild**\n(filename: ${filename}\n${e})`);
        })

        if (!thisMemberInGuild){
            continue;
        }

        const allowed = await executables.tools.get('permsCheck').checkPerms(thisMemberInGuild, ['ADMINISTRATOR']);
        if (!allowed) {
            message.reply(`**Not permited in the target guild!**\n(filename: ${filename}`);
            return 0;
        }

        try {
            await fetch(attachment.url).then(x => x.arrayBuffer()).then(async x => {
                const content = JSON.parse(Buffer.from(x));
                await executables.tools.get('config_loader').writeKey(parsedName.join('_'), content);
            })
        } catch(e){
            message.reply(`**Failed to parse the file!**\n(filename: ${filename})\n${e}`);
            continue;
        }
        message.reply(`**Success!**\n(filename: ${filename})`);
    }
    return 0;
}

module.exports = {
    commandType: "message/messageCreate",
    execute
}