const CommunicationBridge = require('../contracts/CommunicationBridge')
const StateHandler = require('./handlers/StateHandler')
const MessageHandler = require('./handlers/MessageHandler')
const CommandHandler = require('./CommandHandler')
const Discord = require('discord.js')

class DiscordManager extends CommunicationBridge {
  constructor(app) {
    super()

    this.app = app

    this.stateHandler = new StateHandler(this)
    this.messageHandler = new MessageHandler(this, new CommandHandler(this))
  }

  connect() {
    this.client = new Discord.Client({
      allowedMentions: {
        parse: ["roles", "users"],
        repliedUser: false,
    },
    partials: [
        Discord.Partials.Message, // for message
        Discord.Partials.Channel, // for text channel
    ],
    intents: [
        Discord.GatewayIntentBits.Guilds, // for guild related things
        Discord.GatewayIntentBits.GuildMessages, // for guild messages things
        Discord.GatewayIntentBits.MessageContent, // enable if you need message content things
    ],
    })

    this.client.on('ready', () => this.stateHandler.onReady())
    this.client.on('messageCreate', message => this.messageHandler.onMessage(message))

    this.client.login(this.app.config.discord.token).catch(error => {
      this.app.log.error(error)

      process.exit(1)
    })

    process.on('SIGINT', () => this.stateHandler.onClose())
  }

  onBroadcast({ username, message, guildRank }) {
    if(username == "imtoodumbforthis"){
      this.app.discord.client.channels.fetch(this.app.config.discord.channel).then(channel => {
        channel.send({
          embeds: [{
            description: message,
            color: 0x2A2A2A,
            timestamp: new Date(),
            footer: {
              text: guildRank,
            },
            author: {
              name: "Fake Coder",
              icon_url: 'https://www.mc-heads.net/avatar/' + username,
            },
          }],
        })
      })
    }
    else{
      this.app.log.broadcast(`${username} [${guildRank}]: ${message}`, `Discord`)
      switch (this.app.config.discord.messageMode.toLowerCase()) {
        case 'bot':
          this.app.discord.client.channels.fetch(this.app.config.discord.channel).then(channel => {
            channel.send({
              embeds: [{
                description: message,
                color: 0x2A2A2A,
                timestamp: new Date(),
                footer: {
                  text: guildRank,
                },
                author: {
                  name: username,
                  icon_url: 'https://www.mc-heads.net/avatar/' + username,
                },
              }],
            })
          })
          break
  
        case 'webhook':
          message = message.replace(/@/g, '') // Stop pinging @everyone or @here
          this.app.discord.webhook.send(
            message, { username: username, avatarURL: 'https://www.mc-heads.net/avatar/' + username }
          )
          break
  
        default:
          throw new Error('Invalid message mode: must be bot or webhook')
      }
    }
    
  }

  onImageBroadcast(url) {
    this.app.discord.client.channels.fetch(this.app.config.discord.channel).then(channel => {
      channel.send(""+url)
    })
  }

  onTextEmbedBroadcast({ username, message, guildRank, url}) {
    this.app.log.broadcast(`${username} [${guildRank}]: ${message}`, `Discord`)
    switch (this.app.config.discord.messageMode.toLowerCase()) {
      case 'bot':
        this.app.discord.client.channels.fetch(this.app.config.discord.channel).then(channel => {
          channel.send({
            embeds: [{
              description: message,
              color: 0x2A2A2A,
              timestamp: new Date(),
              footer: {
                text: guildRank,
              },
              image: {
                url: url,
              },
              author: {
                name: username,
                icon_url: 'https://www.mc-heads.net/avatar/' + username,
              },
            }],
          })
        })
        break

      case 'webhook':
        message = message.replace(/@/g, '') // Stop pinging @everyone or @here
        this.app.discord.webhook.send(
          message, { username: username, avatarURL: 'https://www.mc-heads.net/avatar/' + username }
        )
        break

      default:
        throw new Error('Invalid message mode: must be bot or webhook')
    }
  }

  onBroadcastNewImage({ username, image, icon}) {
    this.app.log.broadcast(`${username}: ${image}`, `Discord`)
    switch (this.app.config.discord.messageMode.toLowerCase()) {
      case 'bot':
        this.app.discord.client.channels.fetch(this.app.config.discord.channel).then(channel => {
          channel.send({
            embeds: [{
              color: 0x2A2A2A,
              timestamp: new Date(),
              footer: {
                text: "BOT",
              },
              image: {
                url: image,
              },
              author: {
                name: username,
                icon_url: icon,
              },
            }],
          })
        })
        break

      case 'webhook':
        //message = message.replace(/@/g, '') // Stop pinging @everyone or @here
        /*this.app.discord.webhook.send(
          message, { username: username, avatarURL: 'https://www.mc-heads.net/avatar/' + username }
        )*/
        break

      default:
        throw new Error('Invalid message mode: must be bot or webhook')
    }
  }

  onOfficerBroadcast({ username, message, guildRank }) {
    this.app.log.broadcast(`${username} [${guildRank}]: ${message}`, `Officer`)
    switch (this.app.config.discord.messageMode.toLowerCase()) {
      case 'bot':
        this.app.discord.client.channels.fetch(this.app.config.discord.officer).then(channel => {
          channel.send({
            embeds: [{
              description: message,
              color: 0x2A2A2A,
              timestamp: new Date(),
              footer: {
                text: guildRank,
              },
              author: {
                name: username,
                icon_url: 'https://www.mc-heads.net/avatar/' + username,
              },
            }],
          })
        })
        break

      case 'webhook':
        message = message.replace(/@/g, '') // Stop pinging @everyone or @here
        this.app.discord.webhook.send(
          message, { username: username, avatarURL: 'https://www.mc-heads.net/avatar/' + username }
        )
        break

      default:
        throw new Error('Invalid message mode: must be bot or webhook')
    }
  }

  onBroadcastCleanEmbed({ message, color }) {
    this.app.log.broadcast(message, 'Event')

    this.app.discord.client.channels.fetch(this.app.config.discord.channel).then(channel => {
      channel.send({
        embeds: [{
          color: color,
          description: message,
        }]
      })
    })
  }

  onBroadcastCommandEmbed({ username, message}) {
    this.app.log.broadcast(message, 'Event')

    this.app.discord.client.channels.fetch(this.app.config.discord.channel).then(channel => {
      let icon = username.split("'")
      channel.send({
        embeds: [{
          description: message,
          color: 0x2A2A2A,
          timestamp: new Date(),
          footer: {
            text: "BOT",
          },
          author: {
            name: username,
            icon_url: 'https://www.mc-heads.net/avatar/' + icon[0],
          },
        }],
      })
    })
  }

  onBroadcastCommandEmbed2({ username, message}) {
    this.app.log.broadcast(message, 'Event')

    this.app.discord.client.channels.fetch(this.app.config.discord.channel).then(channel => {
      channel.send({
        embeds: [{
          description: message,
          color: 0x2A2A2A,
          timestamp: new Date(),
          footer: {
            text: "BOT",
          },
        }],
      })
    })
  }

  onBroadcastCommandEmbed3({ username, message, icon}) {
    this.app.log.broadcast(message, 'Event')

    this.app.discord.client.channels.fetch(this.app.config.discord.channel).then(channel => {
      channel.send({
        embeds: [{
          description: message,
          color: 0x2A2A2A,
          timestamp: new Date(),
          footer: {
            text: "BOT",
          },
          author: {
            name: username,
            icon_url: icon,
          },
        }],
      })
    })
  }

  onBroadcastOnEmbed({ username, message}) {
    this.app.log.broadcast(message, 'Event')

    this.app.discord.client.channels.fetch(this.app.config.discord.channel).then(channel => {
      let icon = username.split("'")
      channel.send({
        embeds: [{
          title: username,
          description: message,
          color: 0x2A2A2A,
          timestamp: new Date(),
          footer: {
            text: "BOT",
          },
        }],
      })
    })
  }

  onBroadcastLog({ username, message, color }) {
    this.app.log.broadcast(username + ' ' + message, 'Event')

    switch (this.app.config.discord.messageMode.toLowerCase()) {
      case 'bot':
        this.app.discord.client.channels.fetch(this.app.config.discord.channel2).then(channel2 => {
          channel2.send({
            embeds: [{
              color: color,
              description: `${message}`,
              timestamp: new Date(),
              author: {
                name: `${username}`,
                icon_url: 'https://www.mc-heads.net/avatar/' + username,
              },
            }]
          })
        })
        break

      case 'webhook':
        this.app.discord.webhook.send({
          username: username, avatarURL: 'https://www.mc-heads.net/avatar/' + username, embeds: [{
            color: color,
            description: `${username} ${message}`,
          }]
        })
        break

      default:
        throw new Error('Invalid message mode: must be bot or webhook')
    }
  }

  onBroadcastHeadedEmbed({ message, title, icon, color }) {
    this.app.log.broadcast(message, 'Event')

    this.app.discord.client.channels.fetch(this.app.config.discord.channel).then(channel => {
      channel.send({
        embeds: [{
          color: color,
          author: {
            name: title,
            icon_url: icon,
          },
          description: message,
        }]
      })
    })
  }

  onPlayerToggle({ username, message, color }) {
    this.app.log.broadcast(username + ' ' + message, 'Event')

    switch (this.app.config.discord.messageMode.toLowerCase()) {
      case 'bot':
        this.app.discord.client.channels.fetch(this.app.config.discord.channel).then(channel => {
          channel.send({
            embeds: [{
              color: color,
              timestamp: new Date(),
              author: {
                name: `${username} ${message}`,
                icon_url: 'https://www.mc-heads.net/avatar/' + username,
              },
            }]
          })
        })
        break

      case 'webhook':
        this.app.discord.webhook.send({
          username: username, avatarURL: 'https://www.mc-heads.net/avatar/' + username, embeds: [{
            color: color,
            description: `${username} ${message}`,
          }]
        })
        break

      default:
        throw new Error('Invalid message mode: must be bot or webhook')
    }
  }
  onPlayerToggle2({ content, username, message, color }) {
    this.app.log.broadcast(username + ' ' + message, 'Event')

    switch (this.app.config.discord.messageMode.toLowerCase()) {
      case 'bot':
        this.app.discord.client.channels.fetch(this.app.config.discord.channel).then(channel => {
          channel.send({
            content: content,
            embeds: [{
              color: color,
              timestamp: new Date(),
              author: {
                name: `${username} ${message}`,
                icon_url: 'https://www.mc-heads.net/avatar/' + username,
              },
            }]
          })
        })
        break

      case 'webhook':
        this.app.discord.webhook.send({
          username: username, avatarURL: 'https://www.mc-heads.net/avatar/' + username, embeds: [{
            color: color,
            description: `${username} ${message}`,
          }]
        })
        break

      default:
        throw new Error('Invalid message mode: must be bot or webhook')
    }
  }
}

module.exports = DiscordManager
