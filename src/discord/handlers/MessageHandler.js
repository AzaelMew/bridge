const imgur = require('imgur-anonymous-uploader');
const uploader = new imgur("318214bc4f4717f");



class MessageHandler {
  constructor(discord, command) {
    this.discord = discord
    this.command = command
  }

  async onMessage(message) {
    console.log(message.content)
    
    const attachment = message?.attachments.first();
    const url = attachment ? attachment.url : null;
    if(url != null){
      message.content = `${message.content} ${url}`
    }
    if(this.shouldBroadcastOfficerMessage(message)){
      if (this.command.handle(message)) {
        return
      }

      const content = this.stripDiscordContent(message.content).trim()
      if (content.length == 0) {
        return
      }
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
}

module.exports = MessageHandler
