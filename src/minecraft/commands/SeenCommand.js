const MinecraftCommand = require('../../contracts/MinecraftCommand')
const axios = require("axios");
const fs = require('fs');
function incrementNumberInJSON(itemName) {
  // Set the file path for the JSON file
  const jsonFilePath = '../../data.json';

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
function timeSince(t1, t2) {
	let secondsDiff = (t1 - t2) / 1000;
	let minutesDiff = secondsDiff / 60;
	let hoursDiff = minutesDiff / 60;
	let daysDiff = hoursDiff / 24;
	let yearsDiff = daysDiff / 365.25;

	if (secondsDiff > 60 * Math.floor(minutesDiff))
		secondsDiff -= 60 * Math.floor(minutesDiff);

	if (minutesDiff > 60 * Math.floor(hoursDiff))
		minutesDiff -= 60 * Math.floor(hoursDiff);

	if (hoursDiff > 24 * Math.floor(daysDiff))
		hoursDiff -= 24 * Math.floor(daysDiff);

	if (daysDiff > 365.25 * Math.floor(yearsDiff))
		daysDiff -= 365.25 * Math.floor(yearsDiff);


	Math.floor(secondsDiff) === 0
		? (secondsDiff = "")
		: (secondsDiff = `${Math.floor(secondsDiff)}s `);
	Math.floor(minutesDiff) === 0
		? (minutesDiff = "")
		: (minutesDiff = `${Math.floor(minutesDiff)}m `);
	Math.floor(hoursDiff) === 0
		? (hoursDiff = "")
		: (hoursDiff = `${Math.floor(hoursDiff)}h `);
	Math.floor(daysDiff) === 0
		? (daysDiff = "")
		: (daysDiff = `${Math.floor(daysDiff)}d `);
	Math.floor(yearsDiff) === 0
		? (yearsDiff = "")
		: (yearsDiff = `${Math.floor(yearsDiff)}y `);

	return yearsDiff + daysDiff + hoursDiff + minutesDiff + secondsDiff;
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
  let offlineFor
  let lastLogin
  let onlineFor
  let lastSeen
  async function getSeenFromUUID(uuid) {
    try {
        if (uuid == undefined) {
            uuid = "a"
        }
	if (uuid == "f03695547707486ab2308518f04102f7") return
        const { data } = await axios.get(`https://api.hypixel.net/player?key=${process.env.APIKEY}&uuid=${uuid}`)
        let lastLogout = data.player.lastLogout;
        if (data.player.lastLogout == null) {
            return "Api is Disabled"
        }
        else if (data.player.lastLogin > lastLogout) {
            lastLogin = data.player.lastLogin;
            onlineFor = timeSince(Date.now(), lastLogin).toString().trim()
            return `Has been online for ${onlineFor}`
        }
        else {
            offlineFor = timeSince(Date.now(), lastLogout).toString().trim()
            lastSeen = new Date(lastLogout)
            lastSeen = lastSeen.toUTCString()
            return `Has been offline for ${offlineFor}\nThey last logged out ${lastSeen}`
        }
    }
    catch {
        return " never logged into Hypixel"
    }

}
async function getSeenFromUsername(username){
    return await getSeenFromUUID(await getUUIDFromUsername(username))
}
class SeenCommand extends MinecraftCommand {
  constructor(minecraft) {
    super(minecraft)

    this.name = 'seen'
    this.description = `Show's user's last logout date`
  }

  onCommand(username, message) { 
    incrementNumberInJSON("MCSeenCommandCount")
    let args = message.split(" ")
    getSeenFromUsername(args[1]).then(stats=>{
        this.send(`/gc ${args[1]}'s ${stats}`)
      })
  }
}
module.exports = SeenCommand
