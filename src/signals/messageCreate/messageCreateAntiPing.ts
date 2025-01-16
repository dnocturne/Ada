import { Signal, execute } from "sunar";
import { EmbedBuilder, PermissionsBitField } from "discord.js";
import antiPingUserSchema from "../../schemas/anti-ping/antiPingUserSchema";
import antiPingGlobalSettingsSchema from "../../schemas/anti-ping/antiPingGlobalSettingsSchema";
import ticketSchema from "../../schemas/tickets/ticketSchema";

const signal = new Signal("messageCreate");

execute(signal, async (message) => {
	// Ignore messages from bots
	if (message.author.bot) return;

	// Ignore reply mentions
	if (message.reference) return;

	// Ignore messages not in a guild
	if (!message.guild) return;

	// Check if the message contains mentions
	if (message.mentions.users.size > 0) {
		// Check if the message is in a ticket channel
		const isTicketChannel = await ticketSchema.findOne({
			channelId: message.channel.id,
		});

		// Skip anti-ping checks if in a ticket channel
		if (isTicketChannel) return;

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
					.setColor(0xffb3ba)
					.setTitle("❌ | Anti Ping")
					.setDescription(customMessage)
					.addFields({ name: "Ši žinutė yra nuo", value: `${user}` })
					.setFooter({
						text: "Ada | Anti Ping",
						iconURL: message.client.user.displayAvatarURL(),
					});

				try {
					// Handle the reply method
					if (replyMethod === "DM") {
						await message.author.send({
							content: `${message.author}`,
							embeds: [embed],
						});
					} else if (message.channel.isTextBased()) {
						if (replyMethod === "sameChannelKeep") {
							await message.channel.send({
								content: `${message.author}`,
								embeds: [embed],
							});
							await message.delete();
						} else if (replyMethod === "sameChannelDelete") {
							const sentMessage = await message.channel.send({
								content: `${message.author}`,
								embeds: [embed],
							});
							setTimeout(async () => {
								await Promise.all([
									sentMessage.delete(),
									message.delete(),
								]).catch(console.error);
							}, 5000);
						}
					}
				} catch (error) {
					console.error("Error handling anti-ping response:", error);
				}

				// Break the loop after the first match to avoid multiple deletions and messages
				break;
			}
		}
	}
});

export { signal };
