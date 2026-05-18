require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const mongoose = require('mongoose');

const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.MESSAGE_CONTENT],
});

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

// Cargar comandos
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      console.log(`✅ Comando cargado: ${command.data.name}`);
    }
  }
}

// Cargar eventos
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  console.log(`✅ Evento cargado: ${event.name}`);
}

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Conectado a MongoDB');
}).catch(err => {
  console.error('❌ Error conectando a MongoDB:', err);
});

// Login del bot
client.login(process.env.DISCORD_TOKEN);
