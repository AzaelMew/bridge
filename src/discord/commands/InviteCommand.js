const DiscordCommand = require('../../contracts/DiscordCommand')

class InviteCommand extends DiscordCommand {
  constructor(discord) {
    super(discord)

    this.name = 'invite'
    this.aliases = ['i', 'inv']
    this.description = 'Invites the given user to the guild'
  }

  onCommand(message) {
    console.log(message)
    console.log(this.getArgs(message))
    let args = this.getArgs(message)
    console.log(args)
    let user = args.shift()
    console.log(user)
    this.sendMinecraftMessage(`/g invite ${user ? user : ''}`)
  }
}

module.exports = InviteCommand
