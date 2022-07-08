const { MessageActionRow, Modal, TextInputComponent } = require('discord.js');

async function execute(interaction) {
    const pageConfig = await executables.tools.get('config_loader').findConfig(`${interaction.guildId}_pageSettings`, 'hallChannelID', interaction.channelId);
    if (!pageConfig) {
        return 0;
    }

    if (!pageConfig.allowPublicReply){
        const allowed = await executables.tools.get('permsCheck').checkRoleName(interaction.member, 'cfs-moderator');
        if (!allowed) {
            return 0;
        }
    }
    
    const modal = new Modal()
        .setCustomId('reply_cfs_execute')
        .setTitle(`Add reply to cfsid: ${interaction.message.id}`);

    const newTags = new TextInputComponent()
        .setCustomId('newReply')
        .setLabel(`Input reply`)
        .setStyle('PARAGRAPH')
        .setPlaceholder(`type: /rm --all to remove all replies\ntype: /rm ReplyID:<id> to remove specific reply`)
        .setMaxLength(200)

    const firstActionRow = new MessageActionRow().addComponents(newTags);

    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
}

module.exports = {
    commandType: "interactionCreate/button",
    execute
}
