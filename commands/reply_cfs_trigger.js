const { MessageActionRow, Modal, TextInputComponent } = require('discord.js');

async function execute(interaction) {
    const allowed = await executables.tools.get('permsCheck').checkRoleName(interaction.member, 'cfs-moderator');
    if (!allowed) {
        return 0;
    }
    
    const modal = new Modal()
        .setCustomId('edittags_cfs_execute')
        .setTitle(`Add reply to cfsid: ${interaction.message.id}`);

    const newTags = new TextInputComponent()
        .setCustomId('newReply')
        .setLabel(`Input reply`)
        .setStyle('PARAGRAPH')
        .setMaxLength(100)

    const firstActionRow = new MessageActionRow().addComponents(newTags);

    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
}

module.exports = {
    commandType: "interactionCreate/button",
    //slashCommandRegInfo,
    execute
}