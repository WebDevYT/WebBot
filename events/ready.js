'use strict';

// Ready event

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Bot is ready! Logged in as ${client.user.tag}!`);
        client.user.setActivity('!', { type: 'LISTENING' });
    },
};
