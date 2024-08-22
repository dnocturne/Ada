import { Message } from "discord.js";
import { Protector, execute } from "sunar";

const config = require("../../config.json");
const OWNERS = config.Global.Owners_ID;

const ownerOnly = new Protector({
  commands: ["autocomplete", "contextMenu", "slash"],
  components: ["button", "modal", "selectMenu"],
  signals: ["interactionCreate", "messageCreate"],
});

const content = "Tik mano savininkas gali naudoti šią komandą!";

execute(ownerOnly, (arg, next) => {
  const entry = Array.isArray(arg) ? arg[0] : arg;

  if (entry instanceof Message) {
    const isOwner = OWNERS.includes(entry.author.id);
    if (isOwner) return next();
    return entry.reply({ content });
  }

  const isOwner = OWNERS.includes(entry.user.id);

  if (entry.isAutocomplete() && !isOwner) return entry.respond([]);
  const embed = new EmbedBuilder()
    .setColor("#FFB3BA")
    .setTitle("❌ | Klaida")
    .setDescription(content)
    .setFooter({
      text: "Ada | Error",
      iconURL: entry.client.user.displayAvatarURL(),
    });
  if (entry.isRepliable() && !isOwner) return entry.reply({ embeds: [embed] });

  return isOwner && next();
});

export { ownerOnly };
