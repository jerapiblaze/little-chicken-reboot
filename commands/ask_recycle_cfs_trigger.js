async function execute(interaction) {
    const allowed = await executables.tools.get('permsCheck').checkRoleName(interaction.member, 'cfs-moderator');
    if (!allowed) {
        return 0;
    }

    interaction.reply({ content: `Are you sure?`, components: [executables.tools.get('buttons_cfs').buttonRow_askRecycle(interaction.message.id)], ephemeral: true })
}

module.exports = {
    commandType: "interactionCreate/button",
    execute
}