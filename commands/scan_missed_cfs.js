const { SlashCommandBuilder } = require('@discordjs/builders');

const slashCommandRegInfo = new SlashCommandBuilder()
    .setName('scan_missed_cfs')
    .setDescription('Scan for missed cfs in a raw-channel')


// /scan_missed_cfs
async function execute(interaction) {
    if (!interaction.guildId) {
        interaction.reply({ content: "Cannot use in a DM channel.", ephemeral: true});
        return 0;
    }

    const allowed = await executables.tools.get('permsCheck').checkRoleName(interaction.member, 'cfs-moderator');
    if (!allowed) {
        return 0;
    }

    const pageConfig = await executables.tools.get('config_loader').findConfig(`${interaction.guildId}_pageSettings`, 'rawChannelID', interaction.channelId);
    if (!pageConfig) {
        interaction.reply({ content: 'Not in a raw-channel. Please run this command in a raw-channel.', ephemeral: true });
        return 0;
    }

    const channel = interaction.channel;
    await interaction.deferReply({ ephemeral: true });
    await executables.tools.get('scan_missed_cfs_execute').bulkReRaw2Hall(channel, pageConfig).catch(e => {
        interaction.editReply({ content: `Error: ${e}`, ephemeral: true });
    });
    interaction.editReply({ content: `Completed.`, ephemeral: true });
}

module.exports = {
    commandType: "interactionCreate/command",
    slashCommandRegInfo,
    execute
}