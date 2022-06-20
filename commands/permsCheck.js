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
module.exports = {
    commandType: "tools",
    checkRoleName
}