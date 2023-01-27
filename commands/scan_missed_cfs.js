const { SlashCommandBuilder } = require('@discordjs/builders');

const slashCommandRegInfo = new SlashCommandBuilder()
    .setName('scan_missed_cfs')
    .setDescription('Scan for missed cfs in a raw-channel')
    .setDMPermission(false)


// /scan_missed_cfs
async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    if (!interaction.guildId) {
        interaction.editReply({ content: "Cannot use in a DM channel.", ephemeral: true});
        return 0;
    }

    const allowed = await executables.tools.get('permsCheck').checkRoleName(interaction.member, 'cfs-moderator');
    if (!allowed) {
        interaction.editReply({ content: "Not permited!", ephemeral: true });
        return 0;
    }

    const pageConfig = await executables.tools.get('config_loader').findConfig(`${interaction.guildId}_pageSettings`, 'rawChannelID', interaction.channelId);
    if (!pageConfig) {
        interaction.editReply({ content: 'Not in a raw-channel. Please run this command in a raw-channel.', ephemeral: true });
        return 0;
    }

    const channel = interaction.channel;
    await executables.tools.get('scan_missed_cfs_execute').bulkReRaw2Hall(channel, pageConfig).catch(e => {
        interaction.editReply({ content: `Error: ${e}`, ephemeral: true });
    }).then({
        interaction.editReply({ content: `Completed.`, ephemeral: true });
    });
}

module.exports = {
    commandType: "interactionCreate/command",
    slashCommandRegInfo,
    execute
}
