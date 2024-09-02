import { Signal, execute } from "sunar";
import { EmbedBuilder, PermissionsBitField } from "discord.js";
import antiPingUserSchema from "../../schemas/anti-ping/antiPingUserSchema.js";
import antiPingGlobalSettingsSchema from "../../schemas/anti-ping/antiPingGlobalSettingsSchema.js";

const signal = new Signal("messageCreate");

execute(signal, async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Ignore reply mentions
  if (message.reference) return;

  // Check if the message contains mentions
  if (message.mentions.users.size > 0) {
    const mentionedUsers = message.mentions.users;

    for (const [userId, user] of mentionedUsers) {
      // Ignore self-mentions
      if (userId === message.author.id) continue;

      // Check if the mentioned user has the anti-ping system enabled in this guild
      const antiPingUser = await antiPingUserSchema.findOne({
        userId,
        guildId: message.guild.id,
        enabled: true,
      });

      if (antiPingUser) {
        // Check if the message author has 'Administrator' permissions
        const member = await message.guild.members.fetch(message.author.id);
        if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          continue; // Bypass the anti-ping check for administrators
        }

        // Fetch the global settings for the guild
        const guildId = message.guild.id;
        const globalSettings = await antiPingGlobalSettingsSchema.findOne({
          guildId,
        });

        // Determine the reply method
        const replyMethod = globalSettings?.replyMethod || "DM";

        // Create an embed with the custom message
        const customMessage =
          antiPingUser.userMessage || "Jūs negalite minėti šio vartotojo.";
        const embed = new EmbedBuilder()
          .setColor("#FFB3BA")
          .setTitle("❌ | Anti Ping")
          .setDescription(`${customMessage}`)
          .addFields({ name: "User", value: `${user}` })
          .setFooter({
            text: "Ada | Anti Ping",
            iconURL: message.client.user.displayAvatarURL(),
          });

        // Handle the reply method
        if (replyMethod === "DM") {
          // Send the embed to the user who sent the ping via DM
          await message.author.send({
            content: `${message.author}`,
            embeds: [embed],
          });
        } else if (replyMethod === "sameChannelKeep") {
          // Send the embed in the same channel without deleting the original message
          await message.channel.send({
            content: `${message.author}`,
            embeds: [embed],
          });
        } else if (replyMethod === "sameChannelDelete") {
          // Send the embed in the same channel and delete the original message after a delay
          const sentMessage = await message.channel.send({
            content: `${message.author}`,
            embeds: [embed],
          });
          setTimeout(() => {
            sentMessage.delete();
          }, 5000); // Adjust the delay as needed
        }

        // Delete the original message if the reply method is not "sameChannelKeep"
        if (replyMethod !== "sameChannelKeep") {
          await message.delete();
        }

        // Break the loop after the first match to avoid multiple deletions and messages
        break;
      }
    }
  }
});

export { signal };
