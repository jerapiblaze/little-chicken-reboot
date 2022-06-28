async function checkRoleName(member, roleName){
    await member.fetch();
    const memberRoles = member.roles.cache.values();
    for (r of memberRoles){
        if (r.name == roleName){
            return true;
        }
    }
    return false;
}

async function checkPerms(member, perms){
    await member.fetch();
    const memberPermissions = member.permissions;
    for (p of perms){
        if (!memberPermissions.has(Permissions.FLAGS[p])){
            return false;
        }
    }
    return true;
}

async function isOwner(user_id){
    return (user_id == process.env.OWNER_UID)
}

module.exports = {
    commandType: "tools",
    checkRoleName,
    checkPerms,
    isOwner
}