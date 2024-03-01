const DiscordCommand = require('../../contracts/DiscordCommand')
const fs = require('fs');
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
const { version } = require('../../../package.json')

class HelpCommand extends DiscordCommand {
  constructor(discord) {
    super(discord)

    this.name = 'help'
    this.aliases = ['h', 'info']
    this.description = 'Shows this help menu'
  }

  onCommand(message) {
  incrementNumberInJSON("DCHelpCommandCount")
    let discordCommands = []
    let minecraftCommands = []

    this.discord.messageHandler.command.commands.forEach(command => {
      discordCommands.push(`\`!${command.name}\`: ${command.description}`)
    })

    this.discord.app.minecraft.chatHandler.command.commands.forEach(command => {
      minecraftCommands.push(`\`!${command.name}\`: ${command.description}`)
    })

    message.channel.send({
      embeds: [{
        title: 'Bridge Commands',
        description: 'Chat with people in-game and gain access to a variety of commands to use!\n\n',
        fields: [
          {
            name: 'Discord Commands',
            value: `These commands can only be used in this channel.\n\n\`!help\`: Shows the entire bot's commands list.\n\`!top:\` Shows Top Guild EXP from the specified day.\n\`!online (!on)\`: Shows a list of guild members online.\n\`!stalk\`: Shows a specified player's location in Hypixel.\n\`!seen\`: Shows when a specified player was last online.\n\`!stats\`: Shows a specified player's general stats in SkyBlock.\n\`!skills\`: Shows a player's skills in SkyBlock.\n\`!cata\`: Shows a player's Dungeon stats.\n\`!contest\`: Tells you when the next Jacob's Contest is\n\`!networth (!nw)\`: Shows a player's networth.\n\`!render\`: Sends specified slots item to discord and in game with a renderer.`
          },
          {
            name: 'Minecraft Commands',
            value: `These commands can only be used through guild chat in-game.\n\n> **!claim**: Claim guild ranks based on player stats.\n> Refer to <#728262623354683473> for rank requirements.\n\n\`!stats\`: Shows a player's general stats in SkyBlock.\n\`!skills\`: Shows a player's skills in SkyBlock.\n\`!cata\`: Shows a player's Dungeon stats.\n\`!slayer\`: Shows a player's Slayer stats.\n\`!networth (!nw)\`: Shows a player's networth.\n\`!math\`: Calculation command.\n\`!ping\`: Replies with Pong! to the user.\n\`!seen\`: Shows a specified player's last logout date.\n\`!stalk\`: Shows a specified player's location in Hypixel.\n\`!seen\`: Shows a specified player's last logout date.\n\`!translate (!trans)\`: Translate text in different languages\n\`!farmhelper (!fh)\`: Tells you perfect speed to farm the specified crop\n\`!contest\`: Tells you when the next Jacob's Contest is\n\`!render\`: Sends specified slots item to discord and in game with a renderer.`
          },
          {
            name: 'Staff Commands',
            value: `These commands can only be used by staff members.\n\n\`!invite\`: Invites players to the guild.\n\`!setrank\`: Promote or Demote members to a rank.\n\`!kick\`: Kicks a player from the guild\n\`!mute\`: Mutes a player for a specified amount of time\n\`!unmute\`: Unmutes a player from the specified amount of time.\n\`!member\`: Shows weekly Guild EXP of a specified member.\n\`!relog\`: Reboots the bot's minecraft client.\n\`!kickinactive\`: Kicks people who have not logged on for 25 days.`
          },
          {
            name: `Info`,
            value: [
              `Prefix: \`${this.discord.app.config.discord.prefix}\``,
              `Guild Channel: <#${this.discord.app.config.discord.channel}>`,
              `Command Role: <@&${this.discord.app.config.discord.commandRole}>`,
            ].join('\n'),
          },
        ],
        color: 0x2eebf4,
        footer: {
          text: 'Made by Azael'
        },
        timestamp: new Date()
      }], 
      files: ["https://media.discordapp.net/attachments/903390012584894484/1041616688749236385/TEMPEST_-_BRIDGE_2022.png?width=950&height=234"]
    })
  }
}

module.exports = HelpCommand
