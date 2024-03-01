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
async function ask() {
    let eightball = [
        'It is certain.',
        'It is decidedly so.',
        'Without a doubt.',
        'Yes definitely.',
        'You may rely on it.',
        'As I see it, yes.',
        'Most likely.',
        'Outlook good.',
        'Yes.',
        'Signs point to yes.',
        "Don't count on it.",
        'My reply is no.',
        'My sources say no.',
        'Outlook not so good.',
        'Very doubtful.',
        'No way.',
        'Maybe',
        'No.',
        'Depends on the mood of the RNGesus',
        'No',
        'Yes',
    ];
    let index = (Math.floor(Math.random() * Math.floor(eightball.length)));
    return eightball[index]


}
class EightBallCommand extends DiscordCommand {
  constructor(Discord) {
    super(Discord)

    this.name = '8ball'
    this.description = '8ball'
  }

  onCommand(message) {
    ask().then(ans => {
        setTimeout(() => {
          this.sendMinecraftMessage(`/gc ${ans}`)

          message.channel.send({
            embeds: [{
              description: ans,
              color: 0x2A2A2A,
              timestamp: new Date(),
              footer: {
                text: "BOT",
              },
              author: {
                name: `The Magic 8 Ball`,
                icon_url: 'https://cdn.discordapp.com/attachments/1045517755044085762/1084545786886504508/mlfaJuO.png',
              },
            }],
          })
        }, 1000);
      })
  }
}

module.exports = EightBallCommand
