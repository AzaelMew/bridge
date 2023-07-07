const MinecraftCommand = require('../../contracts/MinecraftCommand')

class ReqsCommand extends MinecraftCommand {
  constructor(minecraft) {
    super(minecraft)

    this.name = 'reqs'
    this.aliases = []
    this.description = 'Reqs'
  }

  onCommand(username, message) {
    this.send(`/gc Rank Requirements; Recruit - Skyblock Level 170 | Knight - Skyblock Level 210 | Champion - Skyblock Level 250 | Legend - Skyblock Level 290`)
  }
}

module.exports = ReqsCommand
