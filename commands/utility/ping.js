'use strict';

// Ping command

module.exports = {
    // If command = ping
	name: 'ping',

    // Command aliases
    aliases: ['latency'],

	description: 'Replies with bot latency',

    // Server only command?
    guildOnly: false,

    // Command perms
    permissions: '',

    // Requires args?
    args: false,

    // Command usage
    usage: '',

	// Command cooldown
    cooldown: 5,
    
    // Sends bot latency
    execute(msg, args) {
		msg.channel.send('Pinging...').then(sent => {
            sent.edit(`Bot Latency (ping): ${sent.createdTimestamp - msg.createdTimestamp} ms`);
        });
	},
};
