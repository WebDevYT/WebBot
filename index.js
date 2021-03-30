'use strict';

// WebBot

// Command file system
const fs = require('fs');

// Require discord.js module
const Discord = require('discord.js');

// Config Vars
const token = process.env.Token
const prefix = process.env.Prefix

const client = new Discord.Client();

// Get event files
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

// Event listener
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

// Command listing
client.commands = new Discord.Collection();

// Get command files
const commandFolders = fs.readdirSync('./commands');

// Lists commands in command list
for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}

// Cooldown listing
client.cooldowns = new Discord.Collection();

client.on('message', msg => {
    // Msg log
    console.log(`@${msg.author.tag} in "${msg.guild.name}" in #${msg.channel.name} sent: "${msg.content}"`);

    // Basic args
    // If msg doesn't start w/ prefix, exit
    if (!msg.content.startsWith(prefix) || msg.author.bot) return;

    // Splits prefix/msg
    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // If command doesn't exist, exit
    if (!command) return;

    // Server only command check
    if (command.guildOnly && msg.channel.type === 'dm') {
        return msg.reply('I can\'t execute that command inside DMs! Try using it in a Discord server.');
    }

    // Checks perms for using command
    if (command.permissions) {
        const authorPerms = msg.channel.permissionsFor(msg.author);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
            return msg.reply('You cannot use this command!');
        }
    }

    // Checks if user supplied command args (if needed)
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${msg.author}!`;

        // Checks/replies w/ command usage
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return msg.channel.send(reply);
    }

    const { cooldowns } = client;

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    // Current time
    const now = Date.now();

    // Time of when user triggered command
    const timestamps = cooldowns.get(command.name);

    // Uses cooldown from command file
    // Default 3 secs
    const cooldownAmount = (command.cooldown || 3) * 1000;

    // Get/calculate time until command use & inform user
    if (timestamps.has(msg.author.id)) {
        const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return msg.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    timestamps.set(msg.author.id, now);
    setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);

    try {
        // Calls command
        command.execute(msg, args);
    } catch (error) {

        // Logs errors
        console.error(error);
        msg.reply('There was an error trying to execute that command! Let the developers know by filling out this form - https://forms.gle/CvTEXZ35MKxw5pCa7');
    }
});

// Login bot using token
client.login(token);
