const { MessageActionRow, MessageButton } = require('discord.js');
const buttonRow_approveSuccess = (who, when, link) => {
    return new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setLabel(`${who} ${when}`)
            .setCustomId('ask_recycle_cfs_trigger')
            .setStyle('SUCCESS'),
    )
    .addComponents(
        new MessageButton()
            .setLabel(`Go to cfs`)
            .setStyle('LINK')
            .setURL(link),
    )
    ;
    }

const buttonRow_askRecycle = (cfs_id) => {
    return new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setLabel(`Recycle cfsID: ${cfs_id}`)
                .setCustomId('ask_recycle_cfs_execute')
                .setStyle('SECONDARY'),
        )
}

const buttonRow_approveFail = (errorCode) => {
    return new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setLabel(`${errorCode.length > 70 ? errorCode.substring(0,65)+'...' : errorCode}`)
            .setCustomId('recycle_cfs')
            .setStyle('DANGER'),
    )
    ;
    }
const buttonRow_deny = (who, when) => {
    return new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('recycle_cfs')
            .setLabel(`${who} ${when}`)
            .setEmoji('⛔')
            .setStyle('SECONDARY'),
    )
    ;
    }
const buttonRow_autoDeny = (reason) => {
    if (reason.length > 70){
        reason = `${reason.substring(0, 65)}...`;
    }
    return new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('unblock_cfs')
                .setEmoji('👎')
                .setLabel(`Blocked: ${reason}`)
                .setStyle('SECONDARY'),
        )
        ;
}
const buttonRow_basic = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('approve_cfs')
            .setEmoji('👍')
            .setStyle('PRIMARY'),
    )
    .addComponents(
        new MessageButton()
            .setCustomId('deny_cfs')
            .setEmoji('👎')
            .setStyle('SECONDARY'),
    )
    .addComponents(
        new MessageButton()
            .setCustomId('edittags_cfs_trigger')
            .setLabel('Tags')
            .setStyle('SECONDARY'),
    )
    .addComponents(
        new MessageButton()
            .setCustomId('reply_cfs_trigger')
            .setLabel('Reply')
            .setStyle('SECONDARY'),
    )
    ;
const buttonRow_unblocked = () => {

    return new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('recycle_cfs')
                .setLabel(`Unblocked! Hit me again.`)
                .setStyle('DANGER'),
        )
        ;
}

module.exports = {
    commandType: "tools",
    buttonRow_approveSuccess,
    buttonRow_approveFail,
    buttonRow_deny,
    buttonRow_autoDeny,
    buttonRow_unblocked,
    buttonRow_askRecycle,
    buttonRow_basic
}
