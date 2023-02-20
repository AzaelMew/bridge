const MinecraftCommand = require('../../contracts/MinecraftCommand')
const axios = require("axios");
function convertSecondsToMinutesAndSeconds(milliseconds) {
    var minutes = Math.floor(milliseconds / 60000);
    var seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    //let seconds = milliseconds;
    //let minutes = Math.floor(seconds / 60);
    //seconds = Math.floor(seconds % 60);
    return (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}
async function getJacobs() {
    const { data } = await axios.get("https://dawjaw.net/jacobs")
    for (jEvent of data) {
        let currentTime = Date.now();
        let eventTime = jEvent['time'] * 1000;
        if (currentTime < eventTime) {
            let delta = eventTime - currentTime;
            let timeUntilJacobEvent = convertSecondsToMinutesAndSeconds(delta);
            let eventString = [];
            jEvent['crops'].forEach((crop) => {
                eventString.push(crop);
            });
            let contest = `The next contest starts in: ${timeUntilJacobEvent}\nCrops: \n\n- ${eventString.toString().replaceAll(",",", ")}`
            return contest
        }
    }
}
class JacobCommand extends MinecraftCommand {
    constructor(minecraft) {
        super(minecraft)

        this.name = 'contest'

        this.description = "Says users stats"
    }

    async onCommand(username, message) {
        getJacobs().then(contest => {
            this.minecraft.broadcastCommandEmbed({ username: `Next Jacob's contest`, message: contest.replaceAll(", ","\n- "),
            })
            this.send(`/gc ${contest.replaceAll("\n\n- ","").replaceAll("\n"," ┃ ").replaceAll("- ","")}`)
        })
    }
}

module.exports = JacobCommand