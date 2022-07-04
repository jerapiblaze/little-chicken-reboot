const stripIndent = require('common-tags/lib/stripIndent');
const FB = require('fb');

async function execute(interaction) {
    const allowed = await executables.tools.get('permsCheck').checkRoleName(interaction.member, 'cfs-moderator');
    if (!allowed) {
        return 0;
    }
    
    const pageConfig = await executables.tools.get('config_loader').findConfig(`${interaction.guildId}_pageSettings`, 'hallChannelID', interaction.channelId);
    if (!pageConfig) {
        return 0;
    }

    const pageTags = await executables.tools.get('config_loader').findConfig(`${interaction.guildId}_pageTags`, '_id', pageConfig._id);

    var pageCount = await executables.tools.get('config_loader').findConfig(`${interaction.guildId}_pageCount`, '_id', pageConfig._id);
    if (!pageCount){
        pageCount = { _id: pageConfig._id, count: 0 };
        await executables.tools.get('config_loader').writeConfig(`${interaction.guildId}_pageCount`, '_id', pageConfig._id, pageCount);
    }

    const contentInEmbed = interaction.message.embeds[0].fields;
    var i = 0;
    var parsedContent = contentInEmbed[i].value;

    while (contentInEmbed[i].name.startsWith(contentInEmbed[i])){
        parsedContent += contentInEmbed[i].value;
        i++;
    }

    var replyContent = new String();

    for (f of contentInEmbed.filter(f => f.name.startsWith('ReplyID:'))){
        replyContent += `${f.value}\n`;
    }

    var tagsStrings = new String();
    const tagList = contentInEmbed.filter(f => f.name == 'Tags').length == 1 ? contentInEmbed.filter(f => f.name == 'Tags')[0].value.split(',') : [];
    if (pageTags){
        if (pageTags.tags){
            for (t of tagList) {
                for (pT of pageTags.tags) {
                    if (t != pT.name) {
                        continue;
                    }
                    tagsStrings += `${pT.icon} ${pT.note}\n`;
                    if (pT.censor) {
                        tagsStrings += `.\n.\n.\n.\n.\n.\n.\n`;
                    }
                }
            }
        }
    }
    
    var postContent = `#${pageConfig._id}\n${tagsStrings.trim().length > 0 ? tagsStrings.trim() + `\n` : ``}${parsedContent.trim()}`;
    postContent += `\n`;

    if (replyContent.length > 0){
        postContent += `====\n${replyContent.trim()}\n`
    }

    postContent += stripIndent`
    ====
    [tags] ${tagList.length > 0 ? tagList.join(' ') : `<no_tag>`}
    [time] ${interaction.message.embeds[0].footer.text}
    [cfsID] ${interaction.message.id}
    [cfsCount] #${pageCount.count++}
    [note] ${pageConfig.notes}
    `

    await executables.tools.get('config_loader').writeConfig(`${interaction.guildId}_pageCount`, '_id', pageConfig._id, pageCount);

    await interaction.deferUpdate();

    try {
        FB.setAccessToken(pageConfig.fbToken);
        const fbRes = await FB.api(`${pageConfig.fbPageID}/feed`, 'post', {message: postContent.toString()});
        await interaction.editReply({ components: [executables.tools.get('buttons_cfs').buttonRow_approveSuccess(interaction.user.tag, Moment().tz(process.env.TINEZONE_NAME).format(), `https://fb.com/${fbRes.id}/`)] });
        return 0;
    } catch(e){
        const error = e.response.error;
        await interaction.editReply({ components: [executables.tools.get('buttons_cfs').buttonRow_approveFail(`${error.code}${error.error_subcode ? `(${error.error_subcode})` : ''}_${error.type}`)] });
        return 1;
    }
}

module.exports = {
    commandType: "interactionCreate/button",
    execute
}