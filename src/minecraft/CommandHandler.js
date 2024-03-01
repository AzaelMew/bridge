const fs = require('fs')
const { Collection } = require('discord.js')
function incrementNumberInJSON(itemName) {
  // Set the file path for the JSON file
  const jsonFilePath = '../../data.json';

  // Read the existing JSON file or create an empty object
  let jsonData = {};
  try {
      const jsonString = fs.readFileSync(jsonFilePath, 'utf8');
      jsonData = JSON.parse(jsonString);
  } catch (error) {
      // File does not exist or is not valid JSON, create an empty object
      console.error('Error reading JSON file:', error.message);
  }

  // Get the current number for the specified item or default to 0
  const currentNumber = jsonData[itemName] || 0;

  // Increment the number by 1
  const newNumber = currentNumber + 1;

  // Update the JSON with the new number
  jsonData[itemName] = newNumber;

  // Write the updated JSON back to the file
  fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8');

  console.log(`Number incremented for item "${itemName}". New number: ${newNumber}`);
}

class CommandHandler {
  constructor(minecraft) {
    this.minecraft = minecraft

    this.prefix = '!'
    this.commands = new Collection()

    let commandFiles = fs.readdirSync('./src/minecraft/commands').filter(file => file.endsWith('.js') || file.endsWith('.mjs'))
    for (const file of commandFiles) {
      const command = new (require(`./commands/${file}`))(minecraft)

      this.commands.set(command.name, command)
    }
  }

  handle(player, message) {
    if (!message.startsWith(this.prefix)) {
      return false
    }

    let args = message.slice(this.prefix.length).trim().split(/ +/)
    let commandName = args.shift().toLowerCase()

    let command = this.commands.get(commandName)
      || this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

    if (!command) {
      return false
    }
    incrementNumberInJSON("MCCommandCount")

    this.minecraft.app.log.minecraft(`${player} - [${command.name}] ${message}`)
    command.onCommand(player, message)

    return true
  }
}

module.exports = CommandHandler
