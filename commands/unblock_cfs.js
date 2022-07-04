async function execute(interaction) {
    const allowed = await executables.tools.get('permsCheck').checkRoleName(interaction.member, 'cfs-moderator');
    if (!allowed) {
        return 0;
    }

    interaction.update({ components: [executables.tools.get('buttons_cfs').buttonRow_unblocked()] });
}

module.exports = {
    commandType: "interactionCreate/button",

    execute
}