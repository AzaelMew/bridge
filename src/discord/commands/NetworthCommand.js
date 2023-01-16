const DiscordCommand = require('../../contracts/DiscordCommand')
const axios = require("axios");
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
function numberWithCommas(x) {
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


    const { data } = await axios.get("http://161.35.22.13:187/v2/profiles/" + name + "?key=77ac89bad625453facaa36457eb3cf5c")
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

    let storageec

    storageec = ec + storage
    ret = "Total: $" + numberWithCommas(total) + ". Purse: $" + numberWithCommas(purse) + ". Bank: $" + numberWithCommas(bank) + ". Armor: $" + numberWithCommas(armor) + ". Equipment: $" + numberWithCommas(equ) + ". Wardrobe: $" + numberWithCommas(wardrobe) + ". Inv: $" + numberWithCommas(inventory) + ". Storage: $" + numberWithCommas(storageec) + ". Pets: $" + numberWithCommas(pets) + ". Talis: $" + numberWithCommas(acc)
    return ret

  }
  catch (error) {
    e = error.message
    if (e.includes("status code 500")) {
      return "is an Invalid Username"
    }
    if (e.includes("status code 404")) {
      return "has no Skyblock Profiles"
    }
    else {
      return error
    }
  }
}
class NetworthCommand extends DiscordCommand {
  constructor(discord) {
      super(discord)

      this.name = 'networth'
      this.aliases = ["nw"]
      this.description = `Checks user's location`
  }

  onCommand(message) {
    let args = this.getArgs(message)
    let user = args.shift()
    getNetworthFromUsername(user).then(ret => {
      this.sendMinecraftMessage(`/gc ${user}'s networth: ${ret.replaceAll("\n", "")}`)
      message.channel.send({
        embed: {
          description: ret.replaceAll(".", "\n"),
          color: '2A2A2A',
          timestamp: new Date(),
          footer: {
            text: "BOT",
          },
          author: {
            name: `${user}'s networth`,
            icon_url: 'https://www.mc-heads.net/avatar/' + user,
          },
        },
      })
    })
  }
}

module.exports = NetworthCommand