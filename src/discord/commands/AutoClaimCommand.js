const DiscordCommand = require('../../contracts/DiscordCommand')
const axios = require("axios");
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
    const { data } = await axios.get('https://api.hypixel.net/guild?key=4fd2ea22-23ec-4543-9141-01288a80adfb&player=' + uuid)
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
        await new Promise(resolve => setTimeout(resolve, 150));
        let joined = data.guild.members[i].joined
        joined = new Date(joined).toLocaleString()
        let newData = data.guild.members[i];
        let expValue = Object.values(newData.expHistory)

        let total = expValue[0] + expValue[1] + expValue[2] + expValue[3] + expValue[4] + expValue[5] + expValue[6]
        let xp = total
        console.log(i)
        if (i <= data.guild.members.length - 1) {
          try {
            getActivity(data.guild.members[i].uuid, data.guild.members[i].rank, xp)
          }
          catch {
            console.log("fuck you azael.")
          }
        }
        else if (i == data.guild.members.length) {
          for (s = 0; s < 50; s++) {
            console.log(s)
            await new Promise(resolve => setTimeout(resolve, 50));
            if(s==50){
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
  const { data } = await axios.get(`https://api.hypixel.net/skyblock/profiles?key=4fd2ea22-23ec-4543-9141-01288a80adfb&uuid=${uuid}`)
  let name = await getUsernameFromUUID(uuid)
  let newlvl = 0
  for (b = 0; b < Object.keys(data.profiles).length; b++) {
    if(newlvl < data.profiles[b]?.members[uuid]?.leveling?.experience){
      newlvl = data.profiles[b]?.members[uuid]?.leveling?.experience
    }
  }
  console.log(newlvl)
  if(rank=="Vanguard") {
    if (xp < 50000){
      
    }
    else{
      return;
    }
  };
  if(rank=="Elder") return;
  if(rank=="Guild Master") return;

  if (newlvl >= 23000) {
    if(rank=="Champion") return
    ini.push(`${name} Champion`)
    console.log(ini)
    return
  }
  else if (newlvl >= 17000) {
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
      embed: {
        description: `Checking skyblock levels...`,
        color: '47F049'
      }
    })
  }
}
module.exports = AutoclaimCommand