const DiscordCommand = require('../../contracts/DiscordCommand')

class GuildList extends DiscordCommand {
  constructor(discord) {
    super(discord)

    this.name = 'list'
    this.description = 'Checks G List'
  }

  onCommand() {
    this.sendMinecraftMessage(`/g list`)
  }
}

module.exports = GuildList