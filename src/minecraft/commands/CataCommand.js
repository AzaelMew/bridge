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
async function getDungeonFromUsername(username) {
  return await getDungeonFromUUID(await getUUIDFromUsername(username))
}
async function getDungeonFromUUID(name) {
  try {
    if (name == undefined) {
      name = "a"
    }
    if (name == "f03695547707486ab2308518f04102f7") return
    const { data } = await axios.get('http://192.168.100.197:3000/v1/profiles/' + name + '?key=77ac89bad625453facaa36457eb3cf5c')
    let secrets = data.data[0]?.dungeons.secrets_found
    let lvl = data.data[0].dungeons?.catacombs?.skill?.levelWithProgress || 0
    if (lvl == 50) {
      let total = data.data[0].dungeons?.catacombs?.skill?.totalXp;
      let newNum = total - 569809640
      let overflow = newNum / 200000000
      lvl = lvl + overflow
    }
    let h = data.data[0].dungeons?.classes?.healer?.levelWithProgress || 0
    let m = data.data[0].dungeons?.classes?.mage?.levelWithProgress || 0
    let b = data.data[0].dungeons?.classes?.berserk?.levelWithProgress || 0
    let a = data.data[0].dungeons?.classes?.archer?.levelWithProgress || 0
    let t = data.data[0].dungeons?.classes?.tank?.levelWithProgress || 0
    let av = ((h + m + b + a + t) / 5)
    let stats = "**Cata**: \n➣ " + lvl.toFixed(2) + " **;Average**: \n➣ " + av.toFixed(2) + " **;Archer**: \n➣ " + a.toFixed(2) + " **;Berserk**: \n➣ " + b.toFixed(2) + " **;Healer**: \n➣ " + h.toFixed(2) + " **;Mage**: \n➣ " + m.toFixed(2) + " **;Tank**: \n➣ " + t.toFixed(2) + " **;Secrets**: \n➣ " + numberWithCommas(secrets)
    return stats

  }
  catch (error) {
    return `[ERROR] ${error.response.data.reason}`
  }
}
class CatacombsCommand extends MinecraftCommand {
  constructor(minecraft) {
    super(minecraft)

    this.name = 'cata'
    this.description = "Says users dungeon stats"
  }

  async onCommand(username, message) {
    incrementNumberInJSON("MCCataCommandCount")

    let args = message.split(" ")
    if (message.endsWith("!cata")) {
      getDungeonFromUsername(username).then(stats => {
        if (stats.includes("[ERROR]")) {
          this.send(`/gc ${stats}`)
        }
        else {
          this.send(`/gc ${username}'s cata: ${stats.replaceAll("*", "").replaceAll("\n➣ ", "").replaceAll("\n", "").replaceAll(" ;", ", ")}`)
          this.minecraft.broadcastCommandEmbed({ username: `${username}'s cata`, message: `${stats.replaceAll(";", "\n").replaceAll(":", "")}` })
        }
      })
    }
    else {
      getDungeonFromUsername(args[1]).then(stats => {
        if (stats.includes("[ERROR]")) {
          this.send(`/gc ${stats}`)
        }
        else {
          this.send(`/gc ${args[1]}'s cata: ${stats.replaceAll("*", "").replaceAll("\n➣ ", "").replaceAll("\n", "").replaceAll(" ;", ", ")}`)
          this.minecraft.broadcastCommandEmbed({ username: `${args[1]}'s cata`, message: `${stats.replaceAll(";", "\n").replaceAll(":", "")}` })
        }
      })
    }
  }
}

module.exports = CatacombsCommand
