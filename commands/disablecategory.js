const discord = require('discord.js')

exports.run = (client, message, args, level) => {
    let guild = message.guild
    let category = args[0]
    let commandsArray = client.commands.array()

    let foundCategories = {}
    if (!category ) {
      return message.channel.send("A category name is needed!")
    }
    
    category = category.toProperCase()
    for (x in commandsArray) {
      let command = commandsArray[x]
      if (!foundCategories[command.help.category.toProperCase()]) {
        foundCategories[command.help.category.toProperCase()] = true
      }
    }
    if (!foundCategories[category]) {
      return message.channel.send("This category does not exist!")
    }
    if (category == "Info" || category == "Moderation") {
      return message.channel.send("You cannot disable this category!")
    }

    

    client.getGuildData(guild).then(response => {
      let data = JSON.parse(response)
      if (data) {
        let disabledCategories = data.data.disabledCategories
        if (!disabledCategories[category]) {
          disabledCategories[category] = true
          message.channel.send("Category **" + category + "** disabled!")
          client.saveGuildData(guild, JSON.stringify(data))
        } else {
          message.channel.send("This category is already disabled!")
        }
      }
    })

}

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ["disable-category"],
    permLevel: "Administrator",
};

exports.help = {
    name: "disablecategory",
    category: "Moderation",
    description: "Disables a category of commands",
    usage: "disablecategory [category name]"
};
