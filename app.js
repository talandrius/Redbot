//first import configuration
if (Number(process.version.slice(1).split(".")[0]) < 8) throw new Error("Node 8.0.0 or higher is required. Update Node on your system.");

// Load up the discord.js library
const discord = require("discord.js");
// We also load the rest of the things we need in this file:
const {
    promisify
} = require("util");
const readdir = promisify(require("fs").readdir);
const Enmap = require("enmap");
const cp = require('child_process');
const messages = require('./src/modules/messages.js');


//bind config to client for easy transport
const client = new discord.Client();
const configFile = require('./config/config.json');
client.config = require('./src/modules/config.js')(configFile);
client.logger = require("./src/modules/Logger");
client.functions = require("./src/modules/functions.js")(client);
client.pool = require("./src/modules/db.js")(client);
//webserver starting and handeling
client.server = cp.fork('./src/process/webserver.js');
client.server.send('start');
client.server.on('message', (m) => {
    messages.respond(client, m);
});

//handle the database watcher thread 
client.database = cp.fork('./src/process/database.js');
client.database.on('message', (m) => {
    messages.respond(client, m);
});

client.commands = new Enmap();
client.aliases = new Enmap();
client.settings = new Enmap({
    name: "settings"
});



const init = async () => {

    // Here we load **commands** into memory, as a collection, so they're accessible
    // here and everywhere else.
    const cmdFiles = await readdir("./src/commands/");
    client.logger.log(`Loading a total of ${cmdFiles.length} commands.`);
    cmdFiles.forEach(f => {
        if (!f.endsWith(".js")) return;
        const response = client.loadCommand(f);
        if (response) client.logger.log(response, "log");
    });

    // Then we load events, which will include our message and ready event.
    const evtFiles = await readdir("./src/events/");
    client.logger.log(`Loading a total of ${evtFiles.length} events.`);
    evtFiles.forEach(file => {
        const eventName = file.split(".")[0];
        client.logger.log(`Loading Event: ${eventName}`);
        const event = require(`./src/events/${file}`);
        // Bind the client to any event, before the existing arguments
        // provided by the discord.js event. 
        // This line is awesome by the way. Just sayin'.
        client.on(eventName, event.bind(null, client));
    });

    // Generate a cache of client permissions for pretty perm names in commands.
    client.levelCache = {};
    for (let i = 0; i < client.config.permLevels.length; i++) {
        const thisLevel = client.config.permLevels[i];
        client.levelCache[thisLevel.name] = thisLevel.level;
    }
    //begin discord bot
    client.login(client.config.token);

};


init();