const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');

const slashCommandRegInfo = new SlashCommandBuilder()
    .setName('export_config')
    .setDescription('export configs')
    .setDMPermission(false)
    .addStringOption(option => 
        option.setName('config_type')
            .setDescription('type of config to export')
            .setRequired(true)
            .addChoices(
                { name: '*view existed files', value: '--view-all'},
                { name: '*all', value: '--all'},
                { name: 'Admin masks', value: 'adminMask'},
                { name: 'Banned word list', value: 'bannedWords'},
                { name: 'Page counters', value: 'pageCount'},
                { name: 'Page Settings', value: 'pageSettings'},
                { name: 'Tags in page', value: 'pageTags'}
            ))

async function execute(interaction){
    if (!interaction.guildId){
        return 0;
    }

    const allowed = await executables.tools.get('permsCheck').checkPerms(interaction.member, ['ADMINISTRATOR']);
    if (!allowed){
        return 0;
    }

    const userChoice = interaction.options.getString('config_type');

    await interaction.deferReply({ephemeral: true});

    const fileNames = fs.readdirSync(`${DATA_PATH}/server_configs`).filter(f => f.startsWith(`${interaction.guildId}_`) && f.endsWith('.json'));
    const file2SendList = [];

    if (userChoice == '--view-all'){
        await interaction.editReply({content: `**Avalable files:** ${fileNames}`, ephemeral: true});
        return 0;
    }

    if (userChoice == '--all'){
        for (f of fileNames){
            file2SendList.push(`${DATA_PATH}/server_configs/${f}`);
        }
    } else {
        const requestedFileName = fileNames.find(f => f == `${interaction.guildId}_${userChoice}.json`);
        if (!requestedFileName) {
            await interaction.editReply({ content: 'Error: **404 Not found**', ephemeral: true });
            return 0;
        } else {
            file2SendList.push(`${DATA_PATH}/server_configs/${interaction.guildId}_${userChoice}.json`);
        }
    }

    await interaction.editReply({ content: 'Requested files is here. **To import configs, please DM me.**', files: file2SendList, ephemeral: true});
    return 0;
}

module.exports = {
    commandType: "interactionCreate/command",
    slashCommandRegInfo,
    execute
}