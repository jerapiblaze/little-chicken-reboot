async function execute(interaction) {
    await interaction.deferUpdate();

    const allowed = await executables.tools.get('permsCheck').checkRoleName(interaction.member, 'cfs-moderator');
    if (!allowed) {
        return 0;
    }

    const originalMessageID = interaction.message.id;
    const originalMessage = await interaction.channel.messages.fetch(originalMessageID);
    originalMessage.components = [executables.tools.get('buttons_cfs').buttonRow_basic];
    
    const newMessage = await originalMessage.reply({ embeds:originalMessage.embeds, components:originalMessage.components});
    
    await interaction.editReply({ content: `New cfs: ${newMessage.url}`, components:[]});
}

module.exports = {
    commandType: "interactionCreate/button",
    execute
}