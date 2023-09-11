const DiscordCommand = require('../../contracts/DiscordCommand')
const axios = require("axios");

async function getNeko() {
    const { data } = await axios.get('https://api.thecatapi.com/v1/images/search')
    return data[0].url
}

class CatCommand extends DiscordCommand {
  constructor(discord) {
    super(discord)

    this.name = 'cat'
    this.description = 'cat'
  }

  onCommand(message) {
    let args = this.getArgs(message)
    let user = args.shift()

    getNeko().then(neko => {
        message.channel.send({
            embeds: [{
                image: {
                    url: neko,
                  },
                color: 0x2A2A2A,
                timestamp: new Date(),
                footer: {
                    text: "BOT",
                },
            }],
        })
    })
  }
}

module.exports = CatCommand