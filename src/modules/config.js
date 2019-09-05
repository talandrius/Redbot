module.exports = function config(configuration) {
    const botS = configuration.bot;
    if (!botS.ownerID) throw 'Please set Bot Owner Id in config.ini';
    if (!botS.token) throw 'Please set Bot Token in config.ini';
    const configure = {

        // Bot Owner, level 10 by default. A User ID. Should never be anything else than the bot owner's ID.
        ownerID: botS.ownerID,

        // Bot Admins, level 9 by default. Array of user ID strings.
        admins: botS.adminIds,

        // Bot Support, level 8 by default. Array of user ID strings
        support: botS.support,

        // Your Bot's Token. Available on https://discordapp.com/developers/applications/me
        token: botS.token,
        // Default per-server settings. New guilds have these settings.

        // DO NOT LEAVE ANY OF THESE BLANK, AS YOU WILL NOT BE ABLE TO UPDATE THEM
        // VIA COMMANDS IN THE GUILD.
        database: {
            host: configuration.database.host ? configuration.database.host : '127.0.0.1',
            user: configuration.database.user ? configuration.database.user : 'botuser',
            password: configuration.database.password ? configuration.database.password : 'Pa55w0rd',
            name: configuration.database.name ? configuration.database.name : 'redbot',
            port: configuration.database.port ? configuration.database.port : '3306',
            connections: configuration.database.connections ? configuration.database.connections : 10
        },
        bot: {
            clientId: botS.clientId ? botS.clientId : '',
            description: botS.description ? botS.description : 'The reddest of all the bots',
            prefix: botS.prefix ? botS.prefix : '-',
            ready: botS.ready ? botS.ready : 'I\'m Ready!!!',
            logChannel: botS.logChannel ? botS.logChannel : '439983619633577984',
        },
        server: {
            serverId: configuration.server.serverId ? configuration.server.serverId : '344495686789758976',
            defaultChannel: configuration.server.defaultChannel ? configuration.server.defaultChannel : '344495686789758977',
            modRole: configuration.server.modRole ? configuration.server.modRole : 'Moderator',
            subscriberRole: configuration.server.subscriberRole ? configuration.server.subscriberRole : '586232162815180820',
            welcomeChannel: configuration.server.welcomeChannel ? configuration.server.welcomeChannel : 'welcome',
            welcomeMessage: configuration.server.welcomeMessage ? configuration.server.welcomeMessage : 'Say hello to {{user}}, everyone! We all need a warm welcome sometimes :D',
            welcomeEnabled: configuration.server.welcomeEnabled ? configuration.server.welcomeEnabled : 'false',
            systemNotice: configuration.server.systemNotice ? configuration.server.systemNotice : 'true',
            adminRole: configuration.server.adminRole ? configuration.server.adminRole : 'Team Rocket'
        },
        webserver: {
            port: configuration.webServer.port ? configuration.webServer.port : 7654

        },


        // PERMISSION LEVEL DEFINITIONS.

        permLevels: [
            // This is the lowest permisison level, this is for non-roled users.
            {
                level: 0,
                name: 'User',
                // Don't bother checking, just return true which allows them to execute any command their
                // level allows them to.
                check: () => true
            },

            // This is your permission level, the staff levels should always be above the rest of the roles.
            {
                level: 2,
                // This is the name of the role.
                name: 'Moderator',
                // The following lines check the guild the message came from for the roles.
                // Then it checks if the member that authored the message has the role.
                // If they do return true, which will allow them to execute the command in question.
                // If they don't then return false, which will prevent them from executing the command.
                check: (message) => {
                    try {
                        const modRole = message.guild.roles.find(r => r.name.toLowerCase() === message.settings.modRole.toLowerCase());
                        if (modRole && message.member.roles.has(modRole.id)) return true;
                    } catch (e) {
                        return false;
                    }
                }
            },

            {
                level: 3,
                name: 'Administrator',
                check: (message) => {
                    try {
                        const adminRole = message.guild.roles.find(r => r.name.toLowerCase() === message.settings.adminRole.toLowerCase());
                        return (adminRole && message.member.roles.has(adminRole.id));
                    } catch (e) {
                        return false;
                    }
                }
            },
            // This is the server owner.
            {
                level: 4,
                name: 'Server Owner',
                // Simple check, if the guild owner id matches the message author's ID, then it will return true.
                // Otherwise it will return false.
                check: (message) => message.channel.type === 'text' ? (message.guild.ownerID === message.author.id ? true : false) : false
            },

            // Bot Support is a special inbetween level that has the equivalent of server owner access
            // to any server they joins, in order to help troubleshoot the bot on behalf of owners.
            {
                level: 8,
                name: 'Bot Support',
                // The check is by reading if an ID is part of this array. Yes, this means you need to
                // change this and reboot the bot to add a support user. Make it better yourself!
                check: (message) => message.client.config.support.includes(message.author.id)
            },

            // Bot Admin has some limited access like rebooting the bot or reloading commands.
            {
                level: 9,
                name: 'Bot Admin',
                check: (message) => message.client.config.admins.includes(message.author.id)
            },

            // This is the bot owner, this should be the highest permission level available.
            // The reason this should be the highest level is because of dangerous commands such as eval
            // or exec (if the owner has that).
            {
                level: 10,
                name: 'Bot Owner',
                // Another simple check, compares the message author id to the one stored in the config file.
                check: (message) => message.client.config.ownerID === message.author.id
            }
        ]
    };
    return configure;
};