const DiscordCommand = require('../../contracts/DiscordCommand')
const axios = require("axios");
const fs = require('fs');
function incrementNumberInJSON(itemName) {
  // Set the file path for the JSON file
  const jsonFilePath = '/home/azael/bridge/data.json';

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
function readOrUpdateNumber(jsonFilePath, role) {
  // Read the JSON file
  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  role = role.toLowerCase()
  // Return the number from the JSON data based on the role
  if (role === 'legend') {
      return jsonData.legend;
  } else if (role === 'champion') {
      return jsonData.champion;
  } else if (role === 'knight') {
      return jsonData.knight;
  } else if (role === 'recruit') {
      return jsonData.recruit;
  } else {
      throw new Error('Invalid role. Use "Legend", "Champion", "Knight", or "Recruit".');
  }
}

let ini = []
let adv = []
let vet = []
let champ = []
async function getUUIDFromUsername(username) {
  if (!(/^[a-zA-Z0-9_]{2,16}$/mg.test(username))) {
    return "Error"
  }
  else {
    const { data } = await axios.get('https://api.mojang.com/users/profiles/minecraft/' + username)
    return data.id
  }
}
async function getUsernameFromUUID(uuid) {
  const { data } = await axios.get('https://sessionserver.mojang.com/session/minecraft/profile/' + uuid)
  let username = data.name
  return username
}
async function getGMemberFromUUID(uuid, message) {
  try {
    if (uuid == undefined) {
      uuid = "a"
    }
    const { data } = await axios.get(`https://api.hypixel.net/guild?key=${process.env.APIKEY}&player=` + uuid)
    try {
      if (data.guild.name_lower != "tempestsky") {
        let ret = "This player is not in our guild."
        return ret
      }
    }
    catch {
      let ret = "Please confirm the name of the player you're trying to look up."
      return ret
    }
    if (data.guild.name_lower != "tempestsky") {
      let ret = "This player is not in our guild."
      return ret
    }
    else {
      let targetUUID
      targetUUID = uuid
      let name
      ini = []
      adv = []
      vet = []
      champ = []
      for (i = 0; i < data.guild.members.length + 1; i++) {
        await new Promise(resolve => setTimeout(resolve, 250));
        if (i <= data.guild.members.length - 1) {
          let joined = data?.guild.members[i]?.joined
          joined = new Date(joined).toLocaleString()
          let newData = data.guild.members[i];
          let expValue = Object.values(newData.expHistory)
  
          let total = expValue[0] + expValue[1] + expValue[2] + expValue[3] + expValue[4] + expValue[5] + expValue[6]
          let xp = total
          console.log(i)
          try {
            getActivity(data.guild.members[i].uuid, data.guild.members[i].rank, xp)
          }
          catch {
            console.log("fuck you azael.")
          }
        }
        else if (i == data.guild.members.length) {
          for (s = 0; s < 100; s++) {
            console.log(s)
            await new Promise(resolve => setTimeout(resolve, 50));
            if(s==100){
              return
            }
          }
        }
      }
    }
  }
  catch (error) {
    e = error.message
    if (e.includes("status code 500")) {
      return "Error has occured"
    }
    if (e.includes("status code 404")) {
      return "Error has occured"
    }
    else {
      return error
    }
  }
}
async function getActivity(uuid, rank, xp) {
  let legend = readOrUpdateNumber('/home/azael/level.json' ,"legend");
  let champion = readOrUpdateNumber('/home/azael/level.json' ,"champion");
  let knight = readOrUpdateNumber('/home/azael/level.json' ,"knight");
  
  legend = legend * 100
  champion = champion * 100
  knight = knight * 100

  const { data } = await axios.get(`https://api.hypixel.net/skyblock/profiles?key=${process.env.APIKEY}&uuid=${uuid}`)
  let name = await getUsernameFromUUID(uuid)
  let newlvl = 0
  for (b = 0; b < Object.keys(data.profiles).length; b++) {
    if(newlvl < data.profiles[b]?.members[uuid]?.leveling?.experience){
      newlvl = data.profiles[b]?.members[uuid]?.leveling?.experience
    }
  }
  console.log(newlvl)

  if(rank=="Elder") return;
  if(rank=="Guild Master") return;
  if (newlvl >= legend) {
    if(rank=="Legend") return
    ini.push(`${name} Legend`)
    console.log(ini)
    return
  };
  if (newlvl >= champion) {
    if(rank=="Champion") return
    ini.push(`${name} Champion`)
    console.log(ini)
    return
  }
  else if (newlvl >= knight) {
    if(rank=="Knight") return
    ini.push(`${name} Knight`)
    console.log(ini)

    return
  }
  else {
    if(rank=="Recruit") return
    ini.push(`${name} Recruit`)
    console.log(ini)

    return
  }
}

async function getGMemberFromUsername(username, message) {
  return await getGMemberFromUUID(await getUUIDFromUsername(username), message)
}
class AutoclaimCommand extends DiscordCommand {
  constructor(discord) {
    super(discord)

    this.name = 'autoclaim'
    this.description = 'Kicks inactive people.'
  }

  onCommand(message) {
    getGMemberFromUsername("xephor_ex", message).then(a => {
      console.log(a)
      let cat = 0
      let cat2 = 0
      let cat3 = 0
      let interval = 750; // how much time should the delay between two iterations be (in milliseconds)?
      for (let index = 0; index < ini.length; ++index) {
        let el = ini[index]
        setTimeout(() => {
          console.log(el)
          this.sendMinecraftMessage(`/g setrank ${el}`)
        }, index * interval);
      }
    })
    message.channel.send({
      embeds: [{
        description: `Checking skyblock levels...`,
        color: 0x47F049
      }]
    })
  }
}
module.exports = AutoclaimCommand