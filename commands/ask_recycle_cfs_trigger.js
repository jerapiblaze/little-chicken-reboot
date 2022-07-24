async function execute(interaction) {
    await interaction.deferUpdate();

    const allowed = await executables.tools.get('permsCheck').checkRoleName(interaction.member, 'cfs-moderator');
    if (!allowed) {
        return 0;
    }

    interaction.editReply({ content: `Are you sure?`, components: [executables.tools.get('buttons_cfs').buttonRow_askRecycle(interaction.message.id)], ephemeral: true })
}

module.exports = {
    commandType: "interactionCreate/button",
    execute
}