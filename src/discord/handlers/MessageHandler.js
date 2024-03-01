const imgur = require('imgur-anonymous-uploader');
const uploader = new imgur("318214bc4f4717f");
const axios = require('axios')
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

class MessageHandler {
  constructor(discord, command) {
    this.discord = discord
    this.command = command
  }

  async onMessage(message) {    
    const attachment = message?.attachments.first();
    const url = attachment ? attachment.url : null;
    if(url != null){
      message.content = `${message.content} ${url}`
    }
    let ids = message.content.match(/<@\d{18}>/g)
    if (ids != null){
      let idsL = ids.length
      for(let i = 0; i < idsL; i++) {
        let data = await this.discord.client.users.fetch(ids[i].replace("<@","").replace(">",""))
        console.log(data.username)
        
        message.content = message.content.replace(ids[i], data.username)
      }
    }
    if(this.shouldReadChannel(message)){
      if (this.command.handle(message)) {
        return
      }
    }
    if(this.shouldBroadcastOfficerMessage(message)){
      if (this.command.handle(message)) {
        return
      }

      const content = this.stripDiscordContent(message.content).trim()
      if (content.length == 0) {
        return
      }
      incrementNumberInJSON("DCOfficerMessageCount")

      this.discord.broadcastOfficerMessage({
        username: message.member.displayName,
        message: this.stripDiscordContent(message.content),
        replyingTo: await this.fetchReply(message),
      })
    }
    if (!this.shouldBroadcastMessage(message)) {
      return
    }
    if(message.content.includes("!8ball")){
      incrementNumberInJSON("DC8baLLMessageCount")

      this.discord.broadcastMessage({
        username: message.member.displayName,
        message: this.stripDiscordContent(message.content.replace("!8ball ","")),
        replyingTo: await this.fetchReply(message),
      })
    }
    if (this.command.handle(message)) {
      return
    }

    const content = this.stripDiscordContent(message.content).trim()
    if (content.length == 0) {
      return
    }
    if(message.content.toLowerCase().includes("macro")) return;
    incrementNumberInJSON("DCGuildMessageCount")

    this.discord.broadcastMessage({
      username: message.member.displayName,
      message: this.stripDiscordContent(message.content),
      replyingTo: await this.fetchReply(message),
    })
  }

  async fetchReply(message) {
    try {
      if (!message.reference) return null

      const reference = await message.channel.messages.fetch(message.reference.messageID)

      return reference.member ? reference.member.displayName : reference.author.username
    } catch (e) {
      return null
    }
  }

  stripDiscordContent(message) {
    return message
      .replace(/<[@|#|!|&]{1,2}(\d+){16,}>/g, '\n')
      .replace(/<:\w+:(\d+){16,}>/g, '\n')
      .replace(/<.*:\d{16,20}>/g,"\n")
      .split('\n')
      .map(part => {
        part = part.trim()

        return part.length == 0 ? '' : part + ' '
      })
      .join('')
  }

  shouldBroadcastMessage(message) {
    return !message.author.bot && message.channel.id == this.discord.app.config.discord.channel && message.content && message.content.length > 0
  }
  shouldBroadcastOfficerMessage(message){
    return message.author.id != "903335007244914688" && message.channel.id == this.discord.app.config.discord.officer && message.content && message.content.length > 0
  }
  shouldReadChannel(message){
    return message.channel.id == "1165608524538187896"
  }
}

module.exports = MessageHandler
