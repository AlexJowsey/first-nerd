exports.run = async (client, message, args, level) => {
    let text = args.join(" ")
    let unnotified = []
    if (text == undefined || text.length == 0) {
      return message.channel.send("Need a query!")
    }
    let users = client.users.array()
    let usersNotified = 0
    for (x in users) {
      try {
       users[x].send(text)
       usersNotified = usersNotified + 1
      } catch (err) {
        // nothing
        unnotified.push(err)
      }

    }
    await client.wait(10000)
    message.channel.send(`Out of **${users.length}** users, ${usersNotified - unnotified.length} were notified.`)
}

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ["dmall"],
    permLevel: "Bot Owner"
};

exports.help = {
    name: "alert",
    category: "System",
    description: "Please don't piss everyone off.",
    usage: "alert [alert]"
};
