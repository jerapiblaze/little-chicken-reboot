# Little-chicken-2
*A rebooted version of Little-chicken.*<br>
A bot made for fun.

## How-tos
### Build and launch the bot (locally)
```bat
rem:build the bot
npm i
rem:launch the bot
node main.js
```
### Export configs
1. Use the `/export_config` slash command
2. Select and download the file(s)
### Import configs
1. Prepare the files with correct filename syntax (`<serverid>_<filetype>.json`)
2. Upload the files with message content `/import` in the bot's ***DM box***.
3. Wait for the response from the bot.
### Config files
#### Admin nicknames: `<serverid>_adminMask.json`
```json
[
    {
        "_uid":"423764796375171073",
        "nickname":"#gàe",
        "role":"trùm server"
    }
]
```
#### Banned words `<serverid>_bannedWords.json`
```json
[
    {
        "_id":"test",
        "blockedWords":[
            "gay"
        ]
    }
]
```
#### Page cfs count `<serverid>_pageCount.json`
```json
[
    {
        "_id":"test",
        "count":0
    }
]
```
#### Page settings `<serverid>_pageSettings.json`
```json
[
    {
        "_id":"test",
        "fbToken":"token_here",
        "fbPageID":"fb_page_id",
        "rawChannelID":"raw_channel_id",
        "hallChannelID":"hall_channel_id",
        "allowPublicReply":true, 
        "notes":"Đọc cfs với một chiếc đầu lạnh. Suy nghĩ kĩ rồi mới hành động. Đừng tay nhanh hơn não."
    }
]
```
#### Page Tags `<serverid>_pageTags.json`
```json
[
    {
        "_id":"test",
        "tags":[
            {
                "name":"#offtopic",
                "note":"chuyện ngoài lề",
                "icon":"⬛",
                "censor":true
            }, 
            {
                "name":"#joke",
                "note":"đây là một trò đùa",
                "icon":"🤡",
                "censor": false
            }
        ]
    }
]
```
### Environment variables
**Please config all of the environment variables before launch.**<br>
You can put the `.env.json` file at the root directory or pre-config the variables.
```json
{
    "DISCORD_TOKEN":"discord_token",
    "TIMEZONE_NAME":"Asia/Ho_Chi_Minh",
    "DISCORD_CLIENT_ID":"client_id",
    "DISCORD_TEST_GUILD_ID":"test_guild_id_1,test_guild_id_2",
    "OWNER_UID":"owner_uid",
    "GLOBAL_SLASH":0,
    "ENVIRONMENT":"STABLE",
    "BACKUP_ENABLE":0,
    "BACKUP_CHANNEL":"channel_to_send_backups",
    "RESTORE_AT_STARTUP":0,
    "BACKUP_ON_EXIT":0,
    "BACKUP_INTERVAL":43200000
}
```
Reference to `TIMEZONE_NAME` is [here](https://momentjs.com/timezone/).