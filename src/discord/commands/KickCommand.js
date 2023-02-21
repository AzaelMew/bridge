const DiscordCommand = require('../../contracts/DiscordCommand')
const axios = require("axios");
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
class KickCommand extends DiscordCommand {
  constructor(discord) {
    super(discord)

    this.name = 'kick'
    this.aliases = ['k']
    this.description = 'Kicks the given user from the guild'
  }

  onCommand(message) {
    let args = this.getArgs(message)
    let user = args.shift()
    let reason = args.join(' ')
    if(user.toLowerCase()=="azael_nya") return
    else{
      getUUIDFromUsername(user).then(uuid => {
        let blacklist = fs.readFileSync('/home/azael/bridge/blacklist.txt', 'utf-8');
        let blacklistedIDs = blacklist.trim().split('\n');
            if (!blacklist.includes(uuid)) {
              this.sendMinecraftMessage(`/oc ${user} ${uuid} kicked, and added to blacklist.`)
                blacklist += uuid + "\n";
  
                fs.writeFileSync('/home/azael/bridge/blacklist.txt', blacklist, 'utf-8');
            }
            message.channel.send({
              embed: {
                  description: `${user} has been kicked and blacklisted from joining.`,
                  color: 'cbbeb5',
                  timestamp: new Date(),
                  footer: {
                      text: "BOT",
                  },
              },
          })
        this.sendMinecraftMessage(`/g kick ${user ? user : ''} ${reason ? reason : ''}`)
      })
    }
  }
}

module.exports = KickCommand
