async function execute(interaction) {
    const pageConfig = await executables.tools.get('config_loader').findConfig(`${interaction.guildId}_pageSettings`, 'hallChannelID', interaction.channelId);
    if (!pageConfig) {
        return 0;
    }

    const adminMask = await executables.tools.get('config_loader').findConfig(`${interaction.guildId}_adminMask`, '_uid', interaction.user.id);

    const rawReplyContent = interaction.fields.getTextInputValue('newReply');

    if (rawReplyContent.length == 0){
        return 0;
    }

    const userInfo = adminMask ? `$ ${adminMask.nickname} (${adminMask.role})` : `$ ${interaction.user.tag} (member)`

    const oldEmbedFields = interaction.message.embeds[0].fields;

    var newEmbedFields = oldEmbedFields;

    if (rawReplyContent.startsWith('/rm')){
        const allowed = await executables.tools.get('permsCheck').checkRoleName(interaction.member, 'cfs-moderator');
        if (!allowed) {
            return 0;
        }

        if (rawReplyContent.endsWith('--all')){
            newEmbedFields = oldEmbedFields.filter(f => !f.name.startsWith('ReplyID'));
        } else {
            const parsedCommand = rawReplyContent.split(' ');
            if (!parsedCommand[1]){
                return 0;
            }
            newEmbedFields = oldEmbedFields.filter(f => (!f.name.includes(parsedCommand[1])));
        }
    } else {
        newEmbedFields = oldEmbedFields.filter(f => f.name != 'Tags');
        newEmbedFields.push({ name: `ReplyID:${interaction.id}`, value: `${userInfo}\n${rawReplyContent}`});
        newEmbedFields = Array().concat(newEmbedFields, oldEmbedFields.filter(f => f.name == 'Tags'));
    }
 
    interaction.message.embeds[0].fields = newEmbedFields;
    await interaction.update({ embeds: interaction.message.embeds });
}

module.exports = {
    commandType: "interactionCreate/modalSubmit",
    execute
}