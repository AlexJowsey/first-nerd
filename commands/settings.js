const { inspect } = require("util");
const redis = require('redis')
const discord = require('discord.js')

// This command is to modify/edit guild configuration. Perm Level 3 for admins
// and owners only. Used for changing prefixes and role names and such.

// Note that there's no "checks" in this basic version - no config "types" like
// Role, String, Int, etc... It's basic, to be extended with your deft hands!

// Note the **destructuring** here. instead of `args` we have :
// [action, key, ...value]
// This gives us the equivalent of either:
// const action = args[0]; const key = args[1]; const value = args.slice(2);
// OR the same as:
// const [action, key, ...value] = args;
exports.run = (client, message, [action, key, ...value], level) => { // eslint-disable-line no-unused-vars
  let guild = message.guild
  let guildId = guild.id
  client.getGuildData(guild).then(settings => {
    if (settings) {
      let modifiable = JSON.parse(settings)
      if (action == "edit") {
        if (!key) {
          return message.channel.send("Please provide a setting to edit!")
        }
        if (!value) {
          return message.channel.send("Please return a valid value for this key!")
        }
        if (!modifiable.settings[key]) {
          return message.channel.send("That setting wasn't found!")
        }
        if (key == "botOwnerPerms") {
          message.channel.send("This setting determines whether the bot owner has permissions to all commands in your server.")
        }
        modifiable.settings[key] = value.join(" ")
        client.setData(guildId + "-DATA", JSON.stringify(modifiable)).then(rep => {
          message.channel.send(`Successfully updated **${key}** to **${value.join(" ")}**!`)
        })
      }
      if (action == "view" || !action) {
         let newArray = []
         let embed = new discord.RichEmbed()
         embed.setTitle("Setting Configuration")
         embed.setDescription("These are the settings for your guild! Say `>settings edit (setting) (value)` to change it!\nThe settings are **caSe seNsitiVe**!\n\nNeed more help/info on guild settings? Please join the support server to seek assistance (`>support`)")
         for (var i in modifiable.settings) {
           newArray.push(`${i} => ${modifiable.settings[i]}`)
         }
         let missingKeys = 0
         let oldKeys = 0
         for (x in client.config.defaultSettings.settings) {
           if (!modifiable.settings[x]) {
             missingKeys = missingKeys + 1
           }
         }
         for (x in client.config.defaultSettings.data) {
           if (!modifiable.data[x]) {
             missingKeys = missingKeys + 1
           }
         }

         for (x in modifiable) {
           let section = client.config.defaultSettings[x]
           if (!section) {
             oldKeys = oldKeys + 1
           } else {
             for (key in client.config.defaultSettings[x]) {
               if (!section[key]) {
                 oldKeys = oldKeys + 1
               }
             }
           }
         }
         let str = newArray.join("\n")
         let modifiedStr = "```js\n" + str + "\n```"
         if (missingKeys > 0) {
             embed.addField("Missing Settings", "**Reminder: You are missing **" + missingKeys + "** setting option(s)!\nPlease use `settings update` to get the latest configuration info.")
         }
         if (oldKeys > 0) {
             embed.addField("Old Settings", "**Reminder: You have **" + oldKeys + "** old setting option(s)!\nPlease use `settings update` to get the latest configuration info.")
         }
         embed.addField("Settings", modifiedStr)
         embed.setFooter("ten millien fyreflys", client.user.avatarURL)
         embed.setColor(process.env.purple)
         message.channel.send({embed})

      }
      if (action == "viewall") {
        let prettyPrint = JSON.stringify(modifiable, null, 2)
        client.hastebin(prettyPrint).then(link => {
          message.channel.send("Your guild's entire data has been uploaded to " + link + ".js")
        }).catch(e => {
          message.channel.send("There was an error trying to upload it to Hastebin.")
        })
      }
      if (action == 'reset') {
        client.setData(guildId + "-DATA", JSON.stringify(client.config.defaultSettings))
        message.channel.send("Default settings have been applied!")
      }
      if (action == "update") {
        let updatedKeys = 0
        let removed = 0
        for (x in client.config.defaultSettings) {
          let section = modifiable[x]
          if (!modifiable[x]) {
            updatedKeys = updatedKeys + 1
            modifiable[x] = client.config.defaultSettings[x]
          } else {
            for (key in client.config.defaultSettings[x]) {
              if (!section[key]) {
                updatedKeys = updatedKeys + 1
                section[key] = client.config.defaultSettings[x][key]
              }
            }
          }
        }
        for (x in modifiable) {
          let section = client.config.defaultSettings[x]
          if (!section) {
            removed = removed + 1
            delete modifiable[x]
          } else {
            for (key in client.config.defaultSettings[x]) {
              if (!section[key]) {
                removed = removed + 1
                delete modifiable[x][key]
              }
            }
          }
        }

        if (updatedKeys > 0 || removed > 0) {
          client.setData(guildId + "-DATA", JSON.stringify(modifiable)).then(rep => {
            message.channel.send("**" + updatedKeys + "** settings were added / updated.\n**" + removed + "** settings were removed.")
          })
        } else {
          message.channel.send("You have the latest setting configuration!")
        }

      }
    } else {
      client.setData(guildId + "-DATA", JSON.stringify(client.config.defaultSettings))
      message.channel.send("Default settings have been applied!")
    }


  })

};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["setting", "set", "conf", "config"],
  permLevel: "Server Owner",
  subCommands: [
    "edit - Used to edit a setting.\n`>settings edit prefix !`\n`>settings edit workEarnMax 2400`",
    "view - Used to view settings.\n`>settings view`",
    "reset - Applies default settings.\n`>settings reset`",
    "update - Updates settings.\n`>settings update`",
    "viewall - Uploads ALL your data to Hastebin."
  ]
};

exports.help = {
  name: "settings",
  category: "System",
  description: "Configure server settings for Vanessa!",
  usage: "settings [option, setting, value]\nsettings edit welcomeEnabled false\nsettings update"
};
