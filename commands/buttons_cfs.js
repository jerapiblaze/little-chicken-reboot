const { MessageActionRow, MessageButton } = require('discord.js');
const buttonRow_approveSuccess = (who, when, link) => {
    return new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setLabel(`${who} ${when}`)
            .setCustomId('recycle_cfs')
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
const buttonRow_approveFail = (errorCode) => {
    return new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setLabel(`${errorCode}`)
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
            .setStyle('SECONDARY'),
    )
    ;
    }
const buttonRow_autoDeny = (reason) => {
    if (reason.length > 70){
        reason = reason.substring(0, 69);
    }
    return new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('unblock_cfs')
                .setLabel(`Blocked: ${reason}`)
                .setStyle('SECONDARY'),
        )
        ;
}
const buttonRow_basic = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('approve_cfs')
            .setLabel('Approve')
            .setStyle('PRIMARY'),
    )
    .addComponents(
        new MessageButton()
            .setCustomId('deny_cfs')
            .setLabel('Deny')
            .setStyle('SECONDARY'),
    )
    .addComponents(
        new MessageButton()
            .setCustomId('edittags_cfs_trigger')
            .setLabel('Edit tags')
            .setStyle('SECONDARY'),
    )
    .addComponents(
        new MessageButton()
            .setCustomId('reply_cfs_trigger')
            .setLabel('Add reply')
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
    buttonRow_basic
}