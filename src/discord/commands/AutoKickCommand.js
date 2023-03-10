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
        console.log(i)
        if (i <= data.guild.members.length - 1) {
          try {
            getActivity(data.guild.members[i].uuid, data.guild.members[i].rank)
          }
          catch {
            console.log("fuck you azael.")
          }
        }
        else if (i == data.guild.members.length) {
          for (s = 0; s < 60; s++) {
            console.log(s)
            await new Promise(resolve => setTimeout(resolve, 50));
            if(s==60){
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
async function getActivity(uuid, rank) {
  const { data } = await axios.get(`https://api.hypixel.net/skyblock/profiles?key=4fd2ea22-23ec-4543-9141-01288a80adfb&uuid=${uuid}`)
  let name = await getUsernameFromUUID(uuid)
  if (data.player.displayname == "Rioiyo" || data.player.displayname == "YesPleases" || data.player.displayname == "zabbir" || data.player.displayname == "Frindlo" || data.player.displayname == "Nico_the_Creator" || data.player.displayname == "WhenCarrot" || data.player.displayname == "Legendaryspirits" || data.player.displayname == "MistyTM" || data.player.displayname == "Meir231" || data.player.displayname == "Azael_Nyaa") return
  let newlvl = 0
  for (b = 0; b < Object.keys(data.profiles).length; b++) {
  if(newlvl < data.profiles[b]?.members[uuid]?.leveling?.experience){
    newlvl = data.profiles[b]?.members[uuid].leveling.experience
  }
  }
  if(rank=="Elder") return
  if(rank=="Guild Master") return

  if (newlvl < 13500) {
    ini.push(`${name}`)
    return
  }
  else{
    return
  }
}

async function getGMemberFromUsername(username, message) {
  return await getGMemberFromUUID(await getUUIDFromUsername(username), message)
}
class AutoKickCommand extends DiscordCommand {
  constructor(discord) {
    super(discord)

    this.name = 'autokick'
    this.description = 'Kicks people who do not meet the requirements.'
  }

  onCommand(message) {
    getGMemberFromUsername("xephor_ex", message).then(inis => {
      console.log(inis)
      let cat = 0
      let cat2 = 0
      let cat3 = 0
      let interval = 750; // how much time should the delay between two iterations be (in milliseconds)?
      for (let index = 0; index < ini.length; ++index) {
        let el = ini[index]
        setTimeout(() => {
          console.log(el)
          this.sendMinecraftMessage(`/g kick ${el} You do not meet the reqs for the guild.`)
        }, index * interval);
      }
    })
    message.channel.send({
      embed: {
        description: `Let the purge... **BEGIN!**`,
        color: '47F049'
      }
    })
  }
}
module.exports = AutoKickCommand