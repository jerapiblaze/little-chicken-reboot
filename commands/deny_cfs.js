async function execute(interaction) {
    const allowed = await executables.tools.get('permsCheck').checkRoleName(interaction.member, 'cfs-moderator');
    if (!allowed){
        return 0;
    }
    const adminMask = await executables.tools.get('config_loader').findConfig(`${interaction.guildId}_adminMask`, '_uid', interaction.user.id);
    const userInfo = adminMask ? adminMask.nickname : interaction.user.tag;
    interaction.update({ components: [executables.tools.get('buttons_cfs').buttonRow_deny(userInfo, Moment().tz(process.env.TIMEZONE_NAME).format())] });
}

module.exports = {
    commandType: "interactionCreate/button",
    execute
}