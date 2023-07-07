const DiscordCommand = require('../../contracts/DiscordCommand')

class SetrankCommand extends DiscordCommand {
  constructor(discord) {
    super(discord)

    this.name = 'setrank'
    this.description = `Sets provided user to provded rank`
  }

  onCommand(message) {
    let args = this.getArgs(message)
    let user = args.shift()
    let rank = args.shift()
    if (rank.toLowerCase() == "rec"){
      rank = "Recruit"
    }
    if (rank.toLowerCase() == "leg"){
      rank = "Legend"
    }
    if (rank.toLowerCase() == "knight"){
      rank = "Knight"
    }
    if (rank.toLowerCase() == "champ"){
      rank = "Champion"
    }
    console.log(user, rank)
    this.sendMinecraftMessage(`/g setrank ${user ? user : ''} ${rank ? rank: ''}`)
  }
}

module.exports = SetrankCommand
