const { MessageActionRow, Modal, TextInputComponent } = require('discord.js');

async function execute(interaction) {
    const allowed = await executables.tools.get('permsCheck').checkRoleName(interaction.member, 'cfs-moderator');
    if (!allowed) {
        return 0;
    }

    const modal = new Modal()
        .setCustomId('edittags_cfs_execute')
        .setTitle(`Edit tags for cfsid: ${interaction.message.id}`);

    const newTags = new TextInputComponent()
        .setCustomId('newTags')
        .setLabel(`Syntax: tag_emoji1; tag_emoji2 (max:10)`)
        .setStyle('PARAGRAPH')
        .setPlaceholder(`Leave blank to clear!`)
        .setMaxLength(20)

    const firstActionRow = new MessageActionRow().addComponents(newTags);

    modal.addComponents(firstActionRow);
    
    await interaction.showModal(modal);
}

module.exports = {
    commandType: "interactionCreate/button",
    execute
}