const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Message } = require('discord.js');
const slashCommandRegInfo = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("ping pong");

function execute(interaction){
    const client = interaction.client

    const log = logger.child({ module: "interaction/slash/ping" });
    const { ms2human } = executables.tools.get('timetools');

    const time = Moment().tz(process.env.TIMEZONE_NAME).format();

    const embed = new MessageEmbed()
        .setTitle('🔥 PING PONG')
        .setDescription('A ping pong has just been done.')
        .addFields([
            { name: `${client.ws.ping} ms`, value: 'API Latency', inline: true },
            { name: `${client.ws.totalShards}`, value: 'Shards count', inline: true },
            { name: `Uptime`, value: `\`\`\`md\n# ${ms2human(client.uptime, { label: { days: 'days', hours: 'hours', minutes: 'minutes', seconds: 'seconds' }, min: 3, roundLast: true })} \`\`\`` },
            { name: `My time now`, value: `\`\`\`glsl\n# ${time} \`\`\`` },
            { name: `Host info`, value: `\`\`\`md\n$ NodeJS ${process.version} [${process.platform}](${process.arch})\n\`\`\`` }
        ])
        .setThumbnail(client.user.displayAvatarURL())
    
    interaction.reply({ content: 'pong!', embeds:[embed], ephemeral: true }).catch(e => {
        log.error(e);
    });
}

module.exports = {
    commandType: "interactionCreate/command",
    slashCommandRegInfo,
    execute
}