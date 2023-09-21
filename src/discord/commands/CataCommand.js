const DiscordCommand = require('../../contracts/DiscordCommand')
const axios = require("axios");
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
    console.log("1")
    let secrets = data.data[0]?.dungeons.secrets_found
    let lvl = data.data[0].dungeons?.catacombs?.skill?.levelWithProgress
    if(lvl == 50){
      let total = data.data[0].dungeons?.catacombs?.skill?.totalXp;
      let newNum = total - 569809640
      let overflow = newNum/200000000
      lvl = lvl + overflow
    }
    console.log("2")

    let h = data.data[0].dungeons?.classes?.healer?.levelWithProgress
    let m = data.data[0].dungeons?.classes?.mage?.levelWithProgress
    let b = data.data[0].dungeons?.classes?.berserk?.levelWithProgress
    let a = data.data[0].dungeons?.classes?.archer?.levelWithProgress
    let t = data.data[0].dungeons?.classes?.tank?.levelWithProgress
    console.log("3")

    let av = ((h + m + b + a + t) / 5)
    console.log("4")

    let stats = "**Cata**: \n➣ " + lvl.toFixed(2) + " **;Average**: \n➣ " + av.toFixed(2) + " **;Archer**: \n➣ " + a.toFixed(2) + " **;Berserk**: \n➣ " + b.toFixed(2) + " **;Healer**: \n➣ " + h.toFixed(2) + " **;Mage**: \n➣ " + m.toFixed(2) + " **;Tank**: \n➣ " + t.toFixed(2) + " **;Secrets**: \n➣ " + numberWithCommas(secrets)
    return stats

  }
  catch (error) {
    return `[ERROR] ${error.response.data.reason}`
  }
}
class CatacombsCommand extends DiscordCommand {
  constructor(discord) {
      super(discord)

      this.name = 'cata'
      this.description = "Says users dungeon stats"
    }

  onCommand(message) {
    let args = this.getArgs(message)
    let user = args.shift()
    getDungeonFromUsername(user).then(stats => {
      if(stats.includes("[ERROR]")){
        this.sendMinecraftMessage(`/gc ${stats}`)
        message.channel.send({
          embeds: [{
            description: stats,
            color: 0x2A2A2A,
            timestamp: new Date(),
            footer: {
              text: "BOT",
            },
            author: {
              name: `${user}'s cata`,
              icon_url: 'https://www.mc-heads.net/avatar/' + user,
            },
          }],
        })
      }
      else{
      this.sendMinecraftMessage(`/gc ${user}'s cata: ${stats.replaceAll("*", "").replaceAll("\n➣ ", "").replaceAll("\n", "").replaceAll(" ;", ", ")}`)
      message.channel.send({
        embeds: [{
          description: stats.replaceAll(";", "\n").replaceAll(":",""),
          color: 0x2A2A2A,
          timestamp: new Date(),
          footer: {
            text: "BOT",
          },
          author: {
            name: `${user}'s cata`,
            icon_url: 'https://www.mc-heads.net/avatar/' + user,
          },
        }],
      })
    }
    })
  }
}

module.exports = CatacombsCommand
