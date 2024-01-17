const MinecraftCommand = require('../../contracts/MinecraftCommand')
const axios = require("axios");
const fs = require('fs');
function incrementNumberInJSON(itemName) {
  // Set the file path for the JSON file
  const jsonFilePath = '/home/azael/bridge/data.json';

  // Read the existing JSON file or create an empty object
  let jsonData = {};
  try {
      const jsonString = fs.readFileSync(jsonFilePath, 'utf8');
      jsonData = JSON.parse(jsonString);
  } catch (error) {
      // File does not exist or is not valid JSON, create an empty object
      console.error('Error reading JSON file:', error.message);
  }

  // Get the current number for the specified item or default to 0
  const currentNumber = jsonData[itemName] || 0;

  // Increment the number by 1
  const newNumber = currentNumber + 1;

  // Update the JSON with the new number
  jsonData[itemName] = newNumber;

  // Write the updated JSON back to the file
  fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8');

  console.log(`Number incremented for item "${itemName}". New number: ${newNumber}`);
}
async function getUUIDFromUsername(username){
  if(!(/^[a-zA-Z0-9_]{2,16}$/mg.test(username))){
    return "Error"
  }
  else{
    const { data } = await axios.get('https://api.mojang.com/users/profiles/minecraft/' + username)
    let uuid = data.id
    return data.id
}}

async function getLocationFromUUID(uuid){
    let location = "Holy shit you broke me!! Dm Azael!"
    if(uuid == "f03695547707486ab2308518f04102f7") return
    try{
        const { data } = await axios.get(`https://api.hypixel.net/status?key=${process.env.APIKEY}&uuid=` + uuid)

    if (data.session.online == true){
        if (data.session.gameType == "SKYBLOCK"){
            if (data.session.mode == "garden"){
                location = "Garden"
            }
            if (data.session.mode == "dynamic"){
                location = "Private Island"
            }
            if (data.session.mode == "hub"){
                location = "The Hub"
            }
            if (data.session.mode == "mining_1"){
                location = "Gold Mines"
            }
            if (data.session.mode == "mining_2"){
                location = "Deep Caverns"
            }
            if (data.session.mode == "mining_3"){
                location = "Dwarven Mines"
            }
            if (data.session.mode == "foraging_1"){
                location = "The Park"
            }
            if (data.session.mode == "combat_1"){
                location = "Spider's Den"
            }
            if (data.session.mode == "crimson_isle"){
                location = "Crimson Isle"
            }
            if (data.session.mode == "combat_3"){
                location = "The End"
            }
            if (data.session.mode == "farming_1"){
                location = "The Barn"
            }
            if (data.session.mode == "crystal_hollows"){
                location = "Crystal Hollows"
            }
            if (data.session.mode == "winter"){
                location = "Jerry's Workshop"
            }
            if (data.session.mode == "dungeon"){
                location = "Dungeons"
            }
            if (data.session.mode == "dungeon_hub"){
                location = "Dungeon Hub"
            }
        }
        if (data.session.gameType != "SKYBLOCK"){
            if (data.session.gameType == "PROTOTYPE"){
                location = "Prototype Lobby"
            }
            else if (data.session.gameType == "MAIN"){
                location = "Main Lobby"
            }
            else if (data.session.gameType == "BEDWARS"){
                if(data.session.mode == "LOBBY"){
                    location = "Bedwars Lobby"
                }
                if(data.session.mode == "BEDWARS_EIGHT_ONE"){
                    location = "Solo Bedwars"
                }
                if(data.session.mode == "BEDWARS_EIGHT_TWO"){
                    location = "Duo Bedwars"
                }
                if(data.session.mode == "BEDWARS_FOUR_THREE"){
                    location = "3's Bedwars"
                }
                if(data.session.mode == "BEDWARS_FOUR_FOUR"){
                    location = "4's Bedwars"
                }
                if(data.session.mode == "BEDWARS_TWO_FOUR"){
                    location = "4v4 Bedwars"
                }
            }
            else if (data.session.gameType == "SKYWARS"){
                if(data.session.mode == "LOBBY"){
                    location = "Skywars Lobby"
                }
                if(data.session.mode == "solo_normal"){
                    location = "Skywars Solo Normal"
                }
                if(data.session.mode == "teams_normal"){
                    location = "Skywars Teams Normal"
                }
                if(data.session.mode == "solo_insane"){
                    location = "Skywars Solo Insane"
                }
                if(data.session.mode == "teams_insane"){
                    location = "Skywars Teams Insane"
                }
            }
            else if (data.session.gameType == "MURDER_MYSTERY"){
                location = "Murder Mystery Lobby"
            }
            else if (data.session.gameType == "HOUSING"){
                if (data.session.gameType == "base"){
                    location = "Someone's Housing"
                }
                else{
                    location = "Housing Lobby"
                }
            }
            else if (data.session.gameType == "ARCADE"){
                location = "Arcade Lobby"
            }
            else if (data.session.gameType == "BUILD_BATTLE"){
                location = "Build Battle Lobby"
            }
            else if (data.session.gameType == "DUELS"){
                if (data.session.mode == "LOBBY"){
                    location = "Duels Lobby"
                }
                else{
                    location = "Duels Game"
                }
            }
            else if (data.session.gameType == "TNTGAMES"){
                if (data.session.mode == "TNTRUN"){
                    location = "TNT Run"
                }
                if (data.session.mode == "TNTTAG"){
                    location = "TNT Tag"
                }
                if (data.session.mode == "LOBBY"){
                    location = "TNT Games Lobby"
                }
            }
            else if (data.session.gameType == "SMP"){
                location = "Hypixel SMP"
            }
        }
    }

    if (data.session.online == false){
        location = "Player is Offline"
    }


    return location
}
    catch{
        console.log(process.env.APIKEY)
        location = "Player doesn't exist"
        return location
    }

}

async function getLocationFromUsername(username){
    return await getLocationFromUUID(await getUUIDFromUsername(username))
}

class StalkCommand extends MinecraftCommand {
    constructor(discord) {
      super(discord)
  
      this.name = 'stalk'
      this.description = `Checks user's location`
    }
  
    onCommand(username, message){
        incrementNumberInJSON("MCStalkCommandCount")
        let args = message.split(" ")
        let newusername = args[1]
        getLocationFromUsername(newusername).then(location=>{
        this.send(`/gc ${newusername}'s location: ${location}`)
        })
    }
  }
  
  module.exports = StalkCommand
