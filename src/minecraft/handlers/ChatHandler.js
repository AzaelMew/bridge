const { SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER } = require('constants')
const EventHandler = require('../../contracts/EventHandler')
const MinecraftCommand = require('../../contracts/MinecraftCommand')
const axios = require("axios");
const fs = require('fs');
const { setInterval } = require('timers/promises');

let reta = []
var ret = "";
let mes = "";
let reg = /(\[\w{3,}\+{0,2}\] )?(\w{1,16}) has invited you to join their party!/
let res
let inParty
var lastTime = new Date()
let failSafeCD = new Date();
async function readFileToArray(filename, callback) {
  // Read file contents
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      callback(err);
      return;
    }

    // Parse file contents into an array of strings
    const dataArray = data.trim() ? data.split('\n') : [];

    // Return array of strings
    callback(null, dataArray);
  });
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
async function getStatsFromUsername(username) {
  return await getStatsFromUUID(await getUUIDFromUsername(username))
  
}
async function getGMemberFromUsername(username) {
  return await getGMemberFromUUID(await getUUIDFromUsername(username))
}
async function getScamFromUsername(username) {
  return await getScamFromUUID(await getUUIDFromUsername(username))

}
async function getScamFromUUID(uuid) {
  uuid = uuid.substr(0, 8) + "-" + uuid.substr(8, 4) + "-" + uuid.substr(12, 4) + "-" + uuid.substr(16, 4) + "-" + uuid.substr(20);

  const { data } = await axios.get('https://api.skytils.gg/api/scams/check?uuid=' + uuid)
  console.log("checking")
  if (data.isScammer == true) {
    return `User is a scammer!`
  }
  else {
    return `User is not a scammer.`
  }
}
function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}
async function getGMemberFromUUID(uuid) {
  const { data } = await axios.get('https://api.hypixel.net/guild?key=0897c9a2-68d5-4040-a0a4-deaa283b1495&player=' + uuid)
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
    for (i = 0; i < data.guild.members.length; i++) {
      if (data.guild.members[i].uuid == targetUUID) {
        ret = "join"
        return ret
      }
    }
  }
}
async function getStatsFromUUID(name) {
  await readFileToArray('/home/azael/bridge/blacklist.txt', (err, dataArray) => {
    console.log(name)
    console.log(dataArray)
    if(dataArray.includes(name)){
        return "User has been blocked by the guild blacklist."
    }
  });
  const { data } = await axios.get('http://192.168.100.197:3000/v1/profiles/' + name + '?key=77ac89bad625453facaa36457eb3cf5c')
  let newlvl = 0
  for (b = 0; b < Object.keys(data.data).length; b++) {
      if (newlvl < data.data[b].sblevel) {
          newlvl = data.data[b].sblevel
      }
  }
  let nw = numberWithCommas(data.data[0].networth.networth)
  let farming = data.data[0]?.skills?.farming.level
  let mining = data.data[0]?.skills?.mining.level
  let combat = data.data[0]?.skills?.combat.level
  let foraging = data.data[0]?.skills?.foraging.level
  let fishing = data.data[0]?.skills?.fishing.level
  let enchant = data.data[0]?.skills?.enchanting.level
  let alch = data.data[0]?.skills?.alchemy.level
  let taming = data.data[0]?.skills?.taming.level
  let carp = data.data[0]?.skills?.carpentry.level
  let sa = round((farming + mining + combat + foraging + fishing + enchant + alch + taming + carp) / 9, 1)
  let cata = numberWithCommas(data.data[0].dungeons.catacombs.skill.level)
  let wslayer = data.data[0]?.slayer?.wolf.xp
  let zslayer = data.data[0]?.slayer?.zombie.xp
  let sslayer = data.data[0]?.slayer?.spider.xp
  let eslayer = data.data[0]?.slayer?.enderman.xp
  let bslayer = data.data[0]?.slayer?.blaze.xp

  let slayer = numberWithCommas(wslayer + zslayer + sslayer + eslayer + bslayer)
  if (newlvl >= 135) {
    let stats = `**Skyblock Level** \n➣ ${Math.floor(newlvl)}; **Skill Avg** \n➣ ${sa}; **Slayer** \n➣ ${slayer}; **Cata** \n➣ ${cata}; **Networth** \n➣ $${nw};  Accepted`
    return stats

  }
  else {
    let stats = `**Skyblock Level** \n➣ ${Math.floor(newlvl)}; **Skill Avg** \n➣ ${sa}; **Slayer** \n➣ ${slayer}; **Cata** \n➣ ${cata}; **Networth** \n➣ $${nw};  Denied`
    return stats

  }
}

class StateHandler extends EventHandler {
  constructor(minecraft, command) {
    super()

    this.minecraft = minecraft
    this.command = command
  }

  registerEvents(bot) {
    this.bot = bot

    this.bot.on('message', (...args) => this.onMessage(...args))
  }

  onMessage(event) {
    const message = event.toString().trim()

    if (this.isLobbyJoinMessage(message)) {
      return this.bot.chat('§')
    }

    if (this.isPartyMessage(message)) {
      return this.bot.chat("/p leave")
    }
    if (this.isPartyMessage2(message)) {
      res = message.match(reg)
      let userp = res[2]
      getGMemberFromUsername(userp).then(ret => {
        if (ret == "join") {
          ret = ""
          inParty = true

          setTimeout(() => {
            if (inParty) {
              this.bot.chat(`/p leave`)
            }
          }, 60000)
          console.log(`Joined the party of ${userp}`)
          this.minecraft.broadcastLogEmbed({ username: userp, message: `Partied the bot.`, color: '0000FF' })
          return this.bot.chat(`/p join ${userp}`)
        }
        else {
          return
        }
      })
    }
    if (this.isChichman(message)) {
      return this.bot.chat("/p join chichman11")
    }
    if (this.isShana(message)) {
      return this.bot.chat("/p join shana_splatoon")
    }

    if (this.isLoginMessage(message)) {
      let user = message.split('>')[1].trim().split('joined.')[0].trim()

      return this.minecraft.broadcastPlayerToggle({ username: user, message: `joined.`, color: '47F049' })
    }

    if (this.isLogoutMessage(message)) {
      let user = message.split('>')[1].trim().split('left.')[0].trim()
      if (user == "Shana_Splatoon") {
        return this.minecraft.broadcastPlayerToggle2({ content: "<@403942334766514196>", username: user, message: `left.`, color: 'F04947' })
      }
      return this.minecraft.broadcastPlayerToggle({ username: user, message: `left.`, color: 'F04947' })
    }

    if (this.apiMessage(message)) {
      console.log(message)
      return this.bot.chat("/msg azael_nyaa " + message)
    }

    if (this.isJoinMessage(message)) {
      let user = message.replace(/\[(.*?)\]/g, '').trim().split(/ +/g)[0]
      setTimeout(() => {
        this.bot.chat(`/gc Welcome to TempestSky ${user}! Run !claim in guild chat to claim your roles and join our discord server for chats, bots, giveaways & more through !discord.`)
      }, Math.floor(Math.random() * (6500 - 4500 + 1) + 4500));

      return this.minecraft.broadcastHeadedEmbed({
        message: `${user} joined the guild!`,
        title: `Member Joined`,
        icon: `https://mc-heads.net/avatar/${user}`,
        color: '47F049'
      })
    }

    if (this.isApplyMessage(message)) {
      let user = message.replace(/\[(.*?)\]/g, '').trim().split(/ +/g)[1]
      getStatsFromUsername(user).then(stats => {
        setTimeout(() => {
          this.bot.chat(`/gc ${user}'s stats: ${stats.replaceAll(";", ",").replaceAll("*", "").replaceAll("\n➣ ", "")}`)
          this.minecraft.broadcastCommandEmbed({ username: `${user}'s stats`, message: `${stats.replaceAll(";", "\n")}` })
        }, 750)
        setTimeout(() => {
          if (stats.endsWith("Accepted")) {
            this.bot.chat(`/g accept ${user}`)
          }
        }, 1750);
      })
    }
    if (this.isLeaveMessage(message)) {
      let user = message.replace(/\[(.*?)\]/g, '').trim().split(/ +/g)[0]

      return this.minecraft.broadcastHeadedEmbed({
        message: `${user} left the guild!`,
        title: `Member Left`,
        icon: `https://mc-heads.net/avatar/${user}`,
        color: 'F04947'
      })
    }

    if (this.isKickMessage(message)) {
      let user = message.replace(/\[(.*?)\]/g, '').trim().split(/ +/g)[0]

      return this.minecraft.broadcastHeadedEmbed({
        message: `${user} was kicked from the guild!`,
        title: `Member Kicked`,
        icon: `https://mc-heads.net/avatar/${user}`,
        color: 'F04947'
      })
    }

    if (this.isPromotionMessage(message)) {
      let username = message.replace(/\[(.*?)\]/g, '').trim().split(/ +/g)[0]
      let newRank = message.replace(/\[(.*?)\]/g, '').trim().split(' to ').pop().trim()

      return this.minecraft.broadcastCleanEmbed({ message: `${username} was promoted to ${newRank}`, color: '47F049' })
    }

    if (this.isDemotionMessage(message)) {
      let username = message.replace(/\[(.*?)\]/g, '').trim().split(/ +/g)[0]
      let newRank = message.replace(/\[(.*?)\]/g, '').trim().split(' to ').pop().trim()

      return this.minecraft.broadcastCleanEmbed({ message: `${username} was demoted to ${newRank}`, color: 'F04947' })
    }

    if (this.isBlockedMessage(message)) {
      let blockedMsg = message.match(/".+"/g)[0].slice(1, -1)

      return this.minecraft.broadcastCleanEmbed({ message: `Message \`${blockedMsg}\` blocked by Hypixel.`, color: 'DC143C' })
    }

    if (this.isRepeatMessage(message)) {
      return this.minecraft.broadcastCleanEmbed({ message: `You cannot say the same message twice!`, color: 'DC143C' })
    }

    if (this.isNoPermission(message)) {
      return this.minecraft.broadcastCleanEmbed({ message: `You do not have permission to do this.`, color: 'DC143C' })
    }

    if (this.isIncorrectUsage(message)) {
      return this.minecraft.broadcastCleanEmbed({ message: message.split("'").join("`"), color: 'DC143C' })
    }

    if (this.isGuildRank(message)) {
      mes = reta
      reta = []
      mes = mes.toString().replaceAll(",", " ").replaceAll("_", "\\_").replaceAll("-- ", "\n**").replaceAll(" --", "**")
      return this.minecraft.broadcastOnEmbed({ username: "Players currently online", message: mes })
    }

    if (this.isGTopMessage(message)) {
      mes = ret;
      ret = "";
      mes = mes.replaceAll("_", "\\_");
      return this.minecraft.broadcastCleanEmbed({ message: mes, color: '47F049' })
    }

    if (this.isOnlineInvite(message)) {
      let user = message.replace(/\[(.*?)\]/g, '').trim().split(/ +/g)[2]

      return this.minecraft.broadcastCleanEmbed({ message: `${user} was invited to the guild!`, color: '47F049' })
    }

    if (this.isOfflineInvite(message)) {
      let user = message.replace(/\[(.*?)\]/g, '').trim().split(/ +/g)[6].match(/\w+/g)[0]

      return this.minecraft.broadcastCleanEmbed({ message: `${user} was offline invited to the guild!`, color: '47F049' })
    }

    if (this.isFailedInvite(message)) {
      return this.minecraft.broadcastCleanEmbed({ message: message.replace(/\[(.*?)\]/g, '').trim(), color: 'DC143C' })
    }

    if (this.isGuildMuteMessage(message)) {
      let time = message.replace(/\[(.*?)\]/g, '').trim().split(/ +/g)[7]

      return this.minecraft.broadcastCleanEmbed({ message: `Guild Chat has been muted for ${time}`, color: 'F04947' })
    }

    if (this.isGuildUnmuteMessage(message)) {
      return this.minecraft.broadcastCleanEmbed({ message: `Guild Chat has been unmuted!`, color: '47F049' })
    }

    if (this.isUserMuteMessage(message)) {
      let user = message.replace(/\[(.*?)\]/g, '').trim().split(/ +/g)[3].replace(/[^\w]+/g, '')
      let time = message.replace(/\[(.*?)\]/g, '').trim().split(/ +/g)[5]

      return this.minecraft.broadcastCleanEmbed({ message: `${user} has been muted for ${time}`, color: 'F04947' })
    }

    if (this.isUserUnmuteMessage(message)) {
      let user = message.replace(/\[(.*?)\]/g, '').trim().split(/ +/g)[3]

      return this.minecraft.broadcastCleanEmbed({ message: `${user} has been unmuted!`, color: '47F049' })
    }

    if (this.isSetrankFail(message)) {
      return this.minecraft.broadcastCleanEmbed({ message: `Rank not found.`, color: 'DC143C' })
    }


    if (this.isNotInGuild(message)) {
      let user = message.replace(/\[(.*?)\]/g, '').trim().split(' ')[0]

      return this.minecraft.broadcastCleanEmbed({ message: `${user} is not in the guild.`, color: 'DC143C' })
    }

    if (this.isLowestRank(message)) {
      let user = message.replace(/\[(.*?)\]/g, '').trim().split(' ')[0]

      return this.minecraft.broadcastCleanEmbed({ message: `${user} is already the lowest guild rank!`, color: 'DC143C' })
    }

    if (this.isTooFast(message)) {
      return this.minecraft.app.log.warn(message)
    }

    if (this.isPlayerNotFound(message)) {
      let user = message.split(' ')[8].slice(1, -1)

      return this.minecraft.broadcastCleanEmbed({ message: `Player \`${user}\` not found.`, color: 'DC143C' })
    }
    if (this.isOfficerMessage(message)) {
      let parts = message.split(':')
      let group = parts.shift().trim()
      let hasRank = group.endsWith(']')
  
      let userParts = group.split(' ')
      let username = userParts[userParts.length - (hasRank ? 2 : 1)]
      let guildRank = userParts[userParts.length - 1].replace(/[\[\]]/g, '')
  
      if (guildRank == username) {
        guildRank = 'Member'
      }
  
      if (this.isMessageFromBot(username)) {
        return
      }
  
      const playerMessage = parts.join(':').trim()
      if (playerMessage.length == 0 || this.command.handle(username, playerMessage)) {
        return
      }
  
      if (playerMessage == '@') {
        return
      }
      this.minecraft.broadcastOfficerMessage({
        username: username,
        message: playerMessage,
        guildRank: guildRank,
      })
    }
    if (!this.isGuildMessage(message)) {
      return
    }

    let parts = message.split(':')
    let group = parts.shift().trim()
    let hasRank = group.endsWith(']')

    let userParts = group.split(' ')
    let username = userParts[userParts.length - (hasRank ? 2 : 1)]
    let guildRank = userParts[userParts.length - 1].replace(/[\[\]]/g, '')

    if (guildRank == username) {
      guildRank = 'Member'
    }

    if (this.isMessageFromBot(username)) {
      return
    }

    const playerMessage = parts.join(':').trim()
    if (playerMessage.length == 0 || this.command.handle(username, playerMessage)) {
      return
    }

    if (playerMessage == '@') {
      return
    }
    this.minecraft.broadcastMessage({
      username: username,
      message: playerMessage,
      guildRank: guildRank,
    })
  }

  apiMessage(message) {
    if (message.startsWith("Your new API key is")) {
      return message
    }
  }

  isGuildRank(message) {
    if (message.endsWith('-- Guild Master --')) {
      reta.push(message + "\n")
    }
    if (message.endsWith(' ●')) {
      reta.push(message + "\n")
    }
    if (message.endsWith('-- Elder --')) {
      reta.push(message + "\n")
    }

    if (message.endsWith('-- Champion --')) {
      reta.push(message + "\n")
    }

    if (message.endsWith('-- Knight --')) {
      reta.push(message + "\n")
    }

    if (message.endsWith('-- Squire --')) {
      reta.push(message + "\n")
    }

    if (message.endsWith('-- Recruit --')) {
      reta.push(message + "\n")
    }
    if (message.startsWith('Total Members:')) {
      reta.push("\n" + message + "/125")
    }
    if (message.startsWith("Online Members")) {
      reta.push("\n" + message)
      return reta
    }

  }

  isGTopMessage(message) {
    if (message.includes("Top Guild Experience")) {
      ret += message + "\n\n"
    }
    if (message.startsWith("1.")) {
      ret += message + "\n"
    }
    if (message.startsWith("2.")) {
      ret += message + "\n"
    }
    if (message.startsWith("3.")) {
      ret += message + "\n"
    }
    if (message.startsWith("4.")) {
      ret += message + "\n"
    }
    if (message.startsWith("5.")) {
      ret += message + "\n"
    }
    if (message.startsWith("6.")) {
      ret += message + "\n"
    }
    if (message.startsWith("7.")) {
      ret += message + "\n"
    }
    if (message.startsWith("8.")) {
      ret += message + "\n"
    }
    if (message.startsWith("9.")) {
      ret += message + "\n"
    }
    if (message.startsWith("10.")) {
      ret += message + "\n"
      return ret
    }
  }

  isApplyMessage(message) {
    return message.includes("has requested to join the Guild!")
  }

  isPartyMessage(message) {
    return message.includes("entered The Catacombs, ")
  }

  isChichman(message) {
    return message.includes("chichman11 has invited you to join their party!")
  }
  isShana(message) {
    return message.includes("Shana_Splatoon has invited you to join their party!")
  }

  isOnlineMessage(message) {
    return message.endsWith(' ●')
  }

  isPartyMessage2(message) {
    return message.includes("has invited you to join their party!")
  }

  isMessageFromBot(username) {
    return this.bot.username === username
  }

  isLobbyJoinMessage(message) {
    return (message.endsWith(' the lobby!') || message.endsWith(' the lobby! <<<')) && message.includes('[MVP+')
  }
  
  isOfficerMessage(message) {
    return message.startsWith('Officer >') && message.includes(':')
  }

  isGuildMessage(message) {
    return message.startsWith('Guild >') && message.includes(':')
  }

  isLoginMessage(message) {
    return message.startsWith('Guild >') && message.endsWith('joined.') && !message.includes(':')
  }

  isGuildName(message) {
    return message.startsWith('Guild Name:') && message.endsWith('TempestSB')
  }

  isLogoutMessage(message) {
    return message.startsWith('Guild >') && message.endsWith('left.') && !message.includes(':')
  }

  isJoinMessage(message) {
    return message.includes('joined the guild!') && !message.includes(':')
  }

  isLeaveMessage(message) {
    return message.includes('left the guild!') && !message.includes(':')
  }

  isKickMessage(message) {
    return message.includes('was kicked from the guild by') && !message.includes(':')
  }

  isPromotionMessage(message) {
    return message.includes('was promoted from') && !message.includes(':')
  }

  isDemotionMessage(message) {
    return message.includes('was demoted from') && !message.includes(':')
  }

  isBlockedMessage(message) {
    return message.includes('We blocked your comment') && !message.includes(':')
  }

  isRepeatMessage(message) {
    return message == 'You cannot say the same message twice!'
  }

  isNoPermission(message) {
    return (message.includes('You must be the Guild Master to use that command!') || message.includes('You do not have permission to use this command!') || message.includes("I'm sorry, but you do not have permission to perform this command. Please contact the server administrators if you believe that this is in error.") || message.includes("You cannot mute a guild member with a higher guild rank!") || message.includes("You cannot kick this player!") || message.includes("You can only promote up to your own rank!") || message.includes("You cannot mute yourself from the guild!") || message.includes("is the guild master so can't be demoted!") || message.includes("is the guild master so can't be promoted anymore!")) && !message.includes(":")
  }

  isIncorrectUsage(message) {
    return message.includes('Invalid usage!') && !message.includes(':')
  }

  isOnlineInvite(message) {
    return message.includes('You invited') && message.includes('to your guild. They have 5 minutes to accept.') && !message.includes(':')
  }

  isOfflineInvite(message) {
    return message.includes('You sent an offline invite to') && message.includes('They will have 5 minutes to accept once they come online!') && !message.includes(':')
  }

  isFailedInvite(message) {
    return (message.includes('is already in another guild!') || message.includes('You cannot invite this player to your guild!') || (message.includes("You've already invited") && message.includes("to your guild! Wait for them to accept!")) || message.includes('is already in your guild!')) && !message.includes(':')
  }

  isUserMuteMessage(message) {
    return message.includes('has muted') && message.includes('for') && !message.includes(':')
  }

  isUserUnmuteMessage(message) {
    return message.includes('has unmuted') && !message.includes(':')
  }

  isGuildMuteMessage(message) {
    return message.includes('has muted the guild chat for') && !message.includes(':')
  }

  isGuildUnmuteMessage(message) {
    return message.includes('has unmuted the guild chat!') && !message.includes(':')
  }

  isSetrankFail(message) {
    return message.includes("I couldn't find a rank by the name of ") && !message.includes(':')
  }

  isAlreadyMuted(message) {
    return message.includes('This player is already muted!') && !message.includes(':')
  }

  isNotInGuild(message) {
    return message.includes(' is not in your guild!') && !message.includes(':')
  }

  isLowestRank(message) {
    return message.includes("is already the lowest rank you've created!") && !message.includes(':')
  }

  isAlreadyHasRank(message) {
    return message.includes('They already have that rank!') && !message.includes(':')
  }

  isTooFast(message) {
    return message.includes('You are sending commands too fast! Please slow down.') && !message.includes(':')
  }

  isPlayerNotFound(message) {
    return message.startsWith(`Can't find a player by the name of`)
  }
}

module.exports = StateHandler
