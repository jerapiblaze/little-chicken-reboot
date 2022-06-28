const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

const slashCommandRegInfo = new SlashCommandBuilder()
    .setName('test')
    .setDescription('Dev code sandbox')
    .addStringOption(option =>
        option.setName('code')
            .setDescription('Code to run')
            .setRequired(true));

function chunkString(str, length) {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
}
// /test code:<text>
async function execute(interaction) {
    const allowed = await executables.tools.get('permsCheck').isOwner(interaction.user.id);
    if (!allowed) {
        interaction.reply({ content: `Not permited.`, ephemeral: true });
        return 0;
    }

    await interaction.deferReply({ ephemeral: true });

    const code = interaction.options.getString('code');
    
    const startTime = Date.now();
    var output = '= no output =';

    try {
        output = await eval(code);
    } catch (e) {
        output = e.toString();
    }

    if ((output) && (output.toString().length > 0)) {
        output = chunkString(output.toString(), 1000);
    } else {
        output = ['= no output ='];
    }

    const executeTime = Date.now() - startTime;

    const outputEmbed = new MessageEmbed()
        .setTitle('Dev\'s code sandbox')
        .setColor('0xff0000')
        .setDescription(`
        **DANGEROUS** COMMAND
        ONLY RUN **TRUSTED** CODE
        Hope you know **exactly** what you are doing
        `)
        .addField('Code', `\`\`\`js\n${code}\n\`\`\``)
        .addField('Execute time', `\`\`\`diff\n+ ${executeTime}ms\n\`\`\``)

    if (!(typeof (output) === 'string')) {
        for (var o of output) {
            outputEmbed.addField(`Output`, `\`\`\`js\n${o}\n\`\`\``)
        }
    } else {
        outputEmbed.addField(`Output`, `\`\`\`js\n${output}\n\`\`\``)
    }
    
    interaction.editReply({embeds:[outputEmbed], ephemeral:true});
}

module.exports = {
    commandType: "interactionCreate/command",
    slashCommandRegInfo,
    execute
}