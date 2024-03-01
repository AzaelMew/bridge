// Step 3: Use Node.js fs module to write the JSON string to a file on your system
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
const axios = require("axios");
const DiscordCommand = require('../../contracts/DiscordCommand')
async function getUsernameFromUUID(uuid) {
    const { data } = await axios.get('https://sessionserver.mojang.com/session/minecraft/profile/' + uuid)
    let username = data.name
    return username
  }
async function getUUIDFromUsername(username) {
    if (!(/^[a-zA-Z0-9_]{2,16}$/mg.test(username))) {
        return "Error"
    }
    else {
        const { data } = await axios.get('https://api.mojang.com/users/profiles/minecraft/' + username)
        let uuid = data.id
        let user = username
        return data.id
    }
}
class BlacklistCommand extends DiscordCommand {
    constructor(minecraft) {
        super(minecraft)

        this.name = 'blacklist'

        this.description = 'Gives needed welcome info'
    }

    onCommand(message) {
        if(message.channel.id != "1074902281130086410") return
        let args = this.getArgs(message)
        console.log(args[0])
        getUUIDFromUsername(args[1]).then(async uuid => {
            let blacklist = fs.readFileSync('/home/azael/bridge/blacklist.txt', 'utf-8');
            let blacklistedIDs = blacklist.trim().split('\n');
            console.log(args[1])
            if (args[0] == "add") {
                if (!blacklist.includes(uuid)) {
                    console.log("if",uuid)
                    this.sendMinecraftMessage(`/oc ${args[1]} ${uuid} added to blacklist.`)
                    message.channel.send({
                        embeds: [{
                          description: `${uuid} added to blacklist.`,
                          color: 0x47F049,
                          timestamp: new Date(),
                          footer: {
                            text: "BOT",
                          },
                          author: {
                            name: `${args[1]}`,
                            icon_url: 'https://www.mc-heads.net/avatar/' + args[1],
                          },
                        }],
                      })
                    blacklist += uuid + "\n";

                    // write the updated blacklist back to the file
                    fs.writeFileSync('/home/azael/bridge/blacklist.txt', blacklist, 'utf-8');
                }
                else{
                    console.log("else",uuid)
                    message.channel.send({
                        embeds: [{
                          description: `User is already in the blacklist.`,
                          color: 0x2A2A2A,
                          timestamp: new Date(),
                          footer: {
                            text: "BOT",
                          },
                          author: {
                            name: `${args[1]}`,
                            icon_url: 'https://www.mc-heads.net/avatar/' + args[1],
                          },
                        }],
                      })
                    this.sendMinecraftMessage(`/oc ${args[1]} is already in the blacklist.`)
                }
            }
            else if (args[0] == "remove") {
                this.sendMinecraftMessage(`/oc ${args[1]} ${uuid} removed from blacklist.`)
                message.channel.send({
                    embeds: [{
                      description: `${uuid} removed from blacklist.`,
                      color: 0xDC143C,
                      timestamp: new Date(),
                      footer: {
                        text: "BOT",
                      },
                      author: {
                        name: `${args[1]}`,
                        icon_url: 'https://www.mc-heads.net/avatar/' + args[1],
                      },
                    }],
                  })
                const index = blacklistedIDs.indexOf(uuid);
                if (index > -1) {
                    blacklistedIDs.splice(index, 1);

                    // write the updated blacklist back to the file
                    blacklist = blacklistedIDs.join('\n') + '\n';
                    fs.writeFileSync('blacklist.txt', blacklist, 'utf-8');
                }
            }
            else if (args[0] == "check"){
                if (!blacklist.includes(uuid)){
                    this.sendMinecraftMessage(`/oc ${args[1]} is not in the blacklist.`)
                    message.channel.send({
                        embeds: [{
                          description: `User is not in the blacklist.`,
                          color: 0x2A2A2A,
                          timestamp: new Date(),
                          footer: {
                            text: "BOT",
                          },
                          author: {
                            name: `${args[1]}`,
                            icon_url: 'https://www.mc-heads.net/avatar/' + args[1],
                          },
                        }],
                      })
                }
                else{
                    this.sendMinecraftMessage(`/oc ${args[1]} is blacklisted.`)
                    message.channel.send({
                        embeds: [{
                          description: `User is blacklisted.`,
                          color: 0x2A2A2A,
                          timestamp: new Date(),
                          footer: {
                            text: "BOT",
                          },
                          author: {
                            name: `${args[1]}`,
                            icon_url: 'https://www.mc-heads.net/avatar/' + args[1],
                          },
                        }],
                      })
                }
            }
            else if (args[0] == "list"){
                let blacka = blacklist.split("\n")
                let lists = []
                for (let i = 0; i < blacka.length + 1; i++) {
                    if(i == blacka.length){
                        message.channel.send({
                            embeds: [{
                              description: "- "+lists.toString().replaceAll(",","\n- "),
                              color: 0x2A2A2A,
                              timestamp: new Date(),
                              footer: {
                                text: "BOT",
                              },
                              author: {
                                name: `The Tempest Blacklist`,
                              },
                            }],
                          })
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                    getUsernameFromUUID(blacka[i]).then(ign =>  {
                        console.log(ign)
                        lists.push(ign)
                    })
                }
            }

        })
    }
}

module.exports = BlacklistCommand