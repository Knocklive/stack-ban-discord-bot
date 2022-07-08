const Discord = require('discord.js');

const config = require('./config.json');
const fs = require('fs');

const client = new Discord.Client({
    intents: [
        'GUILDS', 
        'GUILD_MESSAGES',
        'GUILD_MEMBERS',
    ],
    partials: [
        'CHANNEL'
    ]
});


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (message.content.startsWith(config.command)) {
        const args = message.content.slice(config.command.length).split(/ +/);
        const member = message.mentions.members.first();
        if (!member) {
            message.reply('Du musst einen gültigen User angeben. Syntax: `' + config.command + ' <@User>`');
            return;
        } else {
            let data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
            if (data.lvl3user.includes(member.id)) {
                member.ban({reason: config.banreason});
                message.reply('Der User wurde erfolgreich von Server ausgeschlossen.');
                return;
            } else if (member.roles.cache.has(config.warngroups.lvl2)) {
                const newdata = {
                    "lvl3user": data.lvl3user + " " + member.id
                }

                fs.writeFile('./data.json', JSON.stringify(newdata, null, 2), (err) => {
                    if (err) throw err;
                });

                member.ban({reason: config.banreason});
                message.reply('Der User wurde erfolgreich von Server ausgeschlossen. (3. Warnung)');
                return;
            } else if (member.roles.cache.has(config.warngroups.lvl1)) {
                member.roles.add(config.warngroups.lvl2);
                member.roles.remove(config.warngroups.lvl1);
                member.timeout(30 * 60 * 1000);
                message.reply('Der User wurde erfolgreich für 30 Minuten in den Timeout geschickt. (2. Warnung)');
                return;
            } else {
                member.roles.add(config.warngroups.lvl1);
                member.timeout(15 * 60 * 1000);
                message.reply('Der User wurde erfolgreich für 15 Minuten in den Timeout geschickt. (1. Warnung)');
                return;
            }
        }
    }
})


client.login(config.token);