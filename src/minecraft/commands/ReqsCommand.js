const MinecraftCommand = require('../../contracts/MinecraftCommand')

class ReqsCommand extends MinecraftCommand {
  constructor(minecraft) {
    super(minecraft)

    this.name = 'reqs'
    this.aliases = []
    this.description = 'Reqs'
  }

  onCommand(username, message) {
    this.send(`/gc Rank Requirements; Recruit - Skyblock Level 190 | Knight - Skyblock Level 220 | Champion - Skyblock Level 260 | Legend - Skyblock Level 310`)
  }
}

module.exports = ReqsCommand
