const MinecraftCommand = require('../../contracts/MinecraftCommand')
const axios = require("axios");
let rank
function numberWithCommas(x) {
    x = x.toString().split(".")[0]
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}
async function getStatsFromUsername(username, profile) {
    return await getStatsFromUUID(await getUUIDFromUsername(username), profile)
}
async function getUUIDFromUsername(username) {
    if (!(/^[a-zA-Z0-9_]{2,16}$/mg.test(username))) {
        return "Username Error"
    }
    else {
        const { data } = await axios.get('https://api.mojang.com/users/profiles/minecraft/' + username)
        let uuid = data.id
        let user = username
        return data.id
    }
}
async function getStatsFromUUID(name, profile) {
    try {
        if (name == undefined) {
            name = "a"
        }
        if (profile == undefined) {
            profile = "b"
        }
        if (name == "a7cb7319ac7547f0802116f38dc5ca85") {
            rank = "champ"
            return rank
        }
        const { data } = await axios.get('http://192.168.100.197:3000/v2/profiles/' + name + '?key=77ac89bad625453facaa36457eb3cf5c')
        let newlvl = 0
        for (b = 0; b < Object.keys(data.data).length; b++) {
            if (newlvl < data.data[b].sblevel) {
                newlvl = data.data[b].sblevel
            }
        }
        if (newlvl >= 290) {
            rank = "leg"
            return rank
        }
        else if (newlvl >= 250) {
            rank = "champ"
            return rank
        }
        else if (newlvl >= 210) {
            rank = "vet"
            return rank
        }
        else {
            rank = "ini"
            return rank
        }

    }
    catch (error) {
        return `[ERROR] ${error.response.data.reason}`
    }

}

class ClaimCommand extends MinecraftCommand {
    constructor(minecraft) {
        super(minecraft)

        this.name = 'claim'
        this.description = "Claims ranks"
    }
    async onCommand(username, message) {
        let args = message.split(" ")
        getStatsFromUsername(username, args[1]).then(rank => {
            console.log(rank)
            if(rank == "leg") {
                this.send(`/g setrank ${username} Legend`)
                setTimeout(() => {
                    this.send(`/gc ${username}'s rank has been set to Legend! If this is wrong, make sure you're on your main profile, and APIs are on!`)
                }, 1000);
            }
            if (rank == "champ") {
                this.send(`/g setrank ${username} Champion`)
                setTimeout(() => {
                    this.send(`/gc ${username}'s rank has been set to Champion! If this is wrong, make sure you're on your main profile, and APIs are on!`)
                }, 1000);
            }
            if (rank == "vet") {
                this.send(`/g setrank ${username} Knight`)
                setTimeout(() => {
                    this.send(`/gc ${username}'s Your rank has been set to Knight! If this is wrong, make sure you're on your main profile, and APIs are on!`)
                }, 1000);
            }
            if (rank == "ini") {
                this.send(`/g setrank ${username} Recruit`)
                setTimeout(() => {
                    this.send(`/gc ${username}'s rank has been set to Recruit! If this is wrong, make sure you're on your main profile, and APIs are on!`)
                }, 1000);
            }
            else (
                this.send(`/gc ${rank}`)
            )
        })
    }
}
module.exports = ClaimCommand