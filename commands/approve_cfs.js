async function execute(interaction) {
    const allowed = await executables.tools.get('permsCheck').checkRoleName(interaction.member, 'cfs-moderator');
    if (!allowed) {
        return 0;
    }
    
    interaction.update({ components: [executables.tools.get('buttons_cfs').buttonRow_approveSuccess(interaction.user.tag, Moment().tz("Asia/Ho_Chi_Minh").format(), 'https://fb.com/thanh.api.5')] });
    // interaction.update({ components: [executables.tools.get('buttons_cfs').buttonRow_approveFail(`Demo`)] });
}

module.exports = {
    commandType: "interactionCreate/button",
    //slashCommandRegInfo,
    execute
}