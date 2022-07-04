async function execute(interaction) {
    const allowed = await executables.tools.get('permsCheck').checkRoleName(interaction.member, 'cfs-moderator');
    if (!allowed){
        return 0;
    }
    interaction.update({ components: [executables.tools.get('buttons_cfs').buttonRow_deny(interaction.user.tag, Moment().tz("Asia/Ho_Chi_Minh").format())] });
}

module.exports = {
    commandType: "interactionCreate/button",
    execute
}