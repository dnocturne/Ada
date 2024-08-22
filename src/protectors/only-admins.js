import {
  Message,
  PermissionFlagsBits,
  PermissionsBitField,
  EmbedBuilder,
} from "discord.js";
import { Protector, execute } from "sunar";

const adminOnly = new Protector({
  commands: ["autocomplete", "contextMenu", "slash"],
  components: ["button", "modal", "selectMenu"],
  signals: ["interactionCreate", "messageCreate"],
});

const content = "Tik administratoriai gali naudotis šia komandą!";

/** @param {PermissionsBitField | string | undefined} permissions */
function checkIsAdmin(permissions) {
  if (!permissions || typeof permissions === "string") return false;
  return permissions.has(PermissionFlagsBits.Administrator);
}

execute(adminOnly, (arg, next) => {
  const entry = Array.isArray(arg) ? arg[0] : arg;

  const isAdmin = checkIsAdmin(entry.member?.permissions);

  if (entry instanceof Message) {
    if (isAdmin) return next();
    return entry.reply({ content });
  }

  if (entry.isAutocomplete() && !isAdmin) return entry.respond([]);
  const embed = new EmbedBuilder()
    .setColor("#FFB3BA")
    .setTitle("❌ | Klaida")
    .setDescription(content)
    .setFooter({
      text: "Ada | Error",
      iconURL: entry.client.user.displayAvatarURL(),
    });
  if (entry.isRepliable() && !isAdmin) return entry.reply({ embeds: [embed] });

  return isAdmin && next();
});

export { adminOnly };
