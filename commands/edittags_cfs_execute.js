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

    const rawTagsInput = interaction.fields.getTextInputValue('newTags');

    const oldEmbedFields = interaction.message.embeds[0].fields;

    var newEmbedFields = oldEmbedFields.filter(f => f.name != "Tags");

    if (rawTagsInput.length == 0){
        interaction.message.embeds[0].fields = newEmbedFields;
        await interaction.update({embeds: interaction.message.embeds});
        return 0;
    }

    const parsedTagsInput = rawTagsInput.split(';');
    var newTagsString = new Array();
    
    if (pageTags) {
        if (pageTags.tags) {
            for (t of parsedTagsInput) {
                for (pT of pageTags.tags) {
                    if (t != pT.icon) {
                        continue;
                    }
                    newTagsString.push(pT.name);
                }
            }
        }
    }

    newTagsString = newTagsString.join(',');

    newEmbedFields.push({ name: "Tags", value: newTagsString});
    interaction.message.embeds[0].fields = newEmbedFields;
    await interaction.update({ embeds: interaction.message.embeds });
}

module.exports = {
    commandType: "interactionCreate/modalSubmit",
    execute
}