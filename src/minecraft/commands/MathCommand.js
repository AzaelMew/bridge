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
function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}

console.log(makeid(5));
async function math(message){
    message = message.split(" ")
    message.shift()
    message = message.join(" ")
    let data
    let ret 
    try {
      data = await axios.get("http://api.mathjs.org/v4/?expr=" + encodeURIComponent(message.replace(/x/gi, "*")))
      ret = data.data
    }
    catch{
      ret = "Error"
    }
    let ret1
    let ret2
    ret1 = ret.toString().split(".")[0]
    ret2 = ret.toString().split(".")[1]
    ret1 = ret1.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if(ret2 != undefined){
      ret=ret1+"."+ret2
    }
    else{
      ret=ret1
    }
    return ret
}

class MathCommand extends MinecraftCommand {
  constructor(minecraft) {
    super(minecraft)

    this.name = 'math'
    this.aliases = ["calc"]
    this.description = 'Math.'
  }

  onCommand(username, message){
    incrementNumberInJSON("MCMathCommandCount")

    if(username.toLowerCase()=="yespleases") return
    math(message).then(data=>{
      this.send(`/gc ${data} - ${makeid(5)}`)
    })
  }
}

module.exports = MathCommand
