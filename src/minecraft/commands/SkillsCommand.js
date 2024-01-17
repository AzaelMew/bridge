const MinecraftCommand = require('../../contracts/MinecraftCommand')
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
function numberWithCommas(x) {
  if (x > 999815672) {
    x = x.toString().split(".")[0]
    x = x.toString().slice(0, -6) + "815672";
  }
  else {
    x = x.toString().split(".")[0]
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
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
async function getSkillsFromUsername(username) {
  return await getSkillsFromUUID(await getUUIDFromUsername(username))
}
async function getSkillsFromUUID(name) {
  try {
    if (name == undefined) {
      name = "a"
    }
    if (name == "f03695547707486ab2308518f04102f7") return
    const { data } = await axios.get('http://192.168.100.197:3000/v1/profiles/' + name + '?key=77ac89bad625453facaa36457eb3cf5c')

    let farming = data.data[0]?.skills?.farming.level
    let mining = data.data[0]?.skills?.mining.level
    let combat = data.data[0]?.skills?.combat.level
    let foraging = data.data[0]?.skills?.foraging.level
    let fishing = data.data[0]?.skills?.fishing.level
    let enchant = data.data[0]?.skills?.enchanting.level
    let alch = data.data[0]?.skills?.alchemy.level
    let carp = data.data[0]?.skills?.carpentry.level
    let rune = data.data[0]?.skills?.runecrafting.level
    let soci = data.data[0]?.skills?.social.level
    let taming = data.data[0]?.skills?.taming.level

    let sa = round((farming + mining + combat + foraging + fishing + enchant + alch + taming + carp) / 9, 1)

    let skills = `**Skill Avg**:\n➣ ${sa}; **Farm**:\n➣ ${farming}; **Mine**:\n➣ ${mining}; **Comb**:\n➣ ${combat}; **Forage**:\n➣ ${foraging}; **Fish**:\n➣ ${fishing}; **Ench**:\n➣ ${enchant}; **Alch**:\n➣ ${alch}; **Carp**:\n➣ ${carp}; **Rune**:\n➣ ${rune}; **Soci**:\n➣ ${soci}; **Taming**:\n➣ ${taming}; `
    return skills
  }
  catch (error) {
    return `[ERROR] ${error.response.data.reason}`
  }
}



class SkillsCommand extends MinecraftCommand {
  constructor(minecraft) {
    super(minecraft)

    this.name = 'skills'

    this.description = "Says users skills"
  }

  async onCommand(username, message) {
  incrementNumberInJSON("MCSkillsCommandCount")
    let args = message.split(" ")
    if (message.endsWith("!skills")) {
      getSkillsFromUsername(username).then(skills => {
        if (skills.includes("[ERROR]")) {
          this.send(`/gc ${skills}`)
        }
        else {
          this.send(`/gc ${username}'s skills: ${skills.replaceAll(";", ",").replaceAll("*", "").replaceAll("\n➣", "").replaceAll("\n", "")}`)
          this.minecraft.broadcastCommandEmbed({ username: `${username}'s skills`, message: `${skills.replaceAll("; ", "\n").replaceAll(":", "").replace("Skill Avg", "Skill Average").replace("Farm", "Farming").replace("Mine", "Mining").replace("Comb", "Combat").replace("Forage", "Foraging").replace("Fish", "Fishing").replace("Ench", "Enchanting").replace("Alch", "Alchemy").replace("Carp", "Carpentry").replace("Rune", "Runecrafting").replace("Soci", "Social")}` })
        }
      })
    }
    else {
      getSkillsFromUsername(args[1]).then(skills => {
        if (skills.includes("[ERROR]")) {
          this.send(`/gc ${skills}`)
        }
        else {
          this.send(`/gc ${args[1]}'s skills: ${skills.replaceAll(";", ",").replaceAll("*", "").replaceAll("\n➣", "").replaceAll("\n", "")}`)
          this.minecraft.broadcastCommandEmbed({ username: `${args[1]}'s skills`, message: `${skills.replaceAll("; ", "\n").replaceAll(":", "").replace("Skill Avg", "Skill Average").replace("Farm", "Farming").replace("Mine", "Mining").replace("Comb", "Combat").replace("Forage", "Foraging").replace("Fish", "Fishing").replace("Ench", "Enchanting").replace("Alch", "Alchemy").replace("Carp", "Carpentry").replace("Rune", "Runecrafting").replace("Soci", "Social")}` })
        }
      })
    }
  }
}

module.exports = SkillsCommand
