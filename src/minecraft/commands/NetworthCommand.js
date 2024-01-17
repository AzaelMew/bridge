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
function numberWithCommas(number) {
  if (number < 1) {
    return 0
  }
  number = number.toFixed(0);
  decPlaces = 1
  decPlaces = Math.pow(10,decPlaces);
  var abbrev = [ "k", "m", "b", "t" ];
  for (var i=abbrev.length-1; i>=0; i--) {
      var size = Math.pow(10,(i+1)*3);
      if(size <= number) {
           number = Math.round(number*decPlaces/size)/decPlaces;
           if((number == 1000) && (i < abbrev.length - 1)) {
               number = 1;
               i++;
           }
           number += abbrev[i];
           break;
      }
  }
  return number;
}
function mainNum(x) {
  try {
    if (x > 999815672) {
      x = x.toString().split(".")[0]
      x = x.toString().slice(0, -6) + "815672";
    }
    else {
      x = x.toString().split(".")[0]
    }
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  catch {
    return "API Off"
  }
}
async function getNetworthFromUsername(username) {
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
async function getNetworthFromUsername(username) {
  return await getNetworthFromUUID(await getUUIDFromUsername(username))
}
async function getNetworthFromUUID(name) {
  try {
    if (name == undefined) {
      name = "a"
    }
    if (name == "f03695547707486ab2308518f04102f7") return

    const { data } = await axios.get("http://192.168.100.197:3000/v2/profiles/" + name + "?key=77ac89bad625453facaa36457eb3cf5c")
    let total = data.data[0]?.networth?.networth ?? 0
    let purse = data.data[0]?.purse ?? 0
    let bank = data.data[0]?.bank ?? 0
    let ret
    let armor = data.data[0]?.networth?.types?.armor?.total ?? 0
    let wardrobe = data.data[0]?.networth?.types?.wardrobe?.total ?? 0
    let inventory = data.data[0]?.networth?.types?.inventory?.total ?? 0
    let ec = data.data[0]?.networth?.types?.enderchest?.total ?? 0
    let storage = data.data[0]?.networth?.types?.storage?.total ?? 0
    let pets = data.data[0]?.networth?.types?.pets?.total ?? 0
    let acc = data.data[0]?.networth?.types?.accessories?.total ?? 0
    let equ = data.data[0]?.networth?.types?.equipment?.total ?? 0
    let museum = data.data[0]?.networth?.types?.museum?.total ?? 0

    let storageec

    storageec = ec + storage
    ret = "**Total**:\n➣ $" + mainNum(total) + "¨ **Purse:**\n➣ $" + numberWithCommas(purse) + "¨ **Bank:**\n➣ $" + numberWithCommas(bank) + "¨ **Armor:**\n➣ $" + numberWithCommas(armor) + "¨ **Equipment:**\n➣ $" + numberWithCommas(equ) + "¨ **Wardrobe:**\n➣ $" + numberWithCommas(wardrobe) + "¨ **Inventory:**\n➣ $" + numberWithCommas(inventory) + "¨ **Storage:**\n➣ $" + numberWithCommas(storageec) + "¨ **Pets:**\n➣ $" + numberWithCommas(pets) + "¨ **Talis:**\n➣ $" + numberWithCommas(acc) + "¨ **Museum:**\n➣ $" + numberWithCommas(museum)
    return ret

  }
  catch (error) {
    return `[ERROR] ${error.response.data.reason}`
  }
}
class NetworthCommand extends MinecraftCommand {
  constructor(minecraft) {
    super(minecraft)

    this.name = 'networth'
    this.aliases = ['nw']
    this.description = "Says users networth"
  }

  async onCommand(username, message) {
    incrementNumberInJSON("MCNWCommandCount")
    let args = message.split(" ")
    if (message.endsWith("!nw")) {
      getNetworthFromUsername(username).then(nw => {
        if(nw.includes("[ERROR]")){
          this.send(`/gc ${nw}`)
        }
        else{
        this.send(`/gc ${username}'s networth: ${nw.replaceAll("\n", "").replaceAll("*","").replaceAll("➣","")}`)
        this.minecraft.broadcastCommandEmbed({ username: `${username}'s networth`, message: `${nw.replaceAll("¨", "\n")}` })
        }
      })
    }
    else if (message.endsWith("!networth")) {
      getNetworthFromUsername(username).then(nw => {
        if(nw.includes("[ERROR]")){
          this.send(`/gc ${nw}`)
        }
        else{
        this.send(`/gc ${username}'s networth: ${nw.replaceAll("\n", "").replaceAll("*","").replaceAll("➣","")}`)
        this.minecraft.broadcastCommandEmbed({ username: `${username}'s networth`, message: `${nw.replaceAll("¨", "\n")}` })
        }
      })
    }
    else {
      getNetworthFromUsername(args[1]).then(nw => {
        if(nw.includes("[ERROR]")){
          this.send(`/gc ${nw}`)
        }
        else{
        this.send(`/gc ${args[1]}'s networth: ${nw.replaceAll("\n", "").replaceAll("*","").replaceAll("➣","")}`)
        this.minecraft.broadcastCommandEmbed({ username: `${args[1]}'s networth`, message: `${nw.replaceAll("¨", "\n")}` })
        }
      })
    }
  }
}

module.exports = NetworthCommand
