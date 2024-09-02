import { EmbedBuilder } from "discord.js";
import ticketSchema from "../../schemas/tickets/ticketSchema.js";
import ticketSettingsSchema from "../../schemas/tickets/ticketSettingsSchema.js";
import discordTranscripts from "discord-html-transcripts";

async function handleCloseTicketReason(interaction, reason) {
  const guildId = interaction.guild.id;
  const channelId = interaction.channel.id;
  const channelName = interaction.channel.name; // Capture the channel name before deletion

  // Fetch the ticket information from the database
  const ticket = await ticketSchema.findOne({ channelId });
  if (!ticket) {
    const noTicket = new EmbedBuilder()
      .setColor("#FFB3BA")
      .setTitle("❌ | Klaida")
      .setDescription("Bilietas nerastas.")
      .setFooter({
        text: "Ada | Error",
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    return interaction.reply({ embeds: [noTicket], ephemeral: true });
  }

  // Acknowledge the interaction before deleting the channel
  await interaction.reply({
    content: "Bilietas uždaromas...",
    ephemeral: true,
  });

  // Generate the transcript
  const attachment = await discordTranscripts.createTranscript(
    interaction.channel
  );

  // Fetch ticket settings for logging
  const ticketSettings = await ticketSettingsSchema.findOne({ guildId });
  const logsChannelId = ticketSettings ? ticketSettings.logsChannelId : null;
  const wordLimit = ticketSettings ? ticketSettings.wordLimit : 0;

  // Calculate the total number of words in the channel messages
  const messages = await interaction.channel.messages.fetch();
  const totalWords = messages.reduce(
    (count, message) => count + message.content.split(/\s+/).length,
    0
  );

  // Check if the word count meets the word limit
  if (wordLimit === 0 || totalWords >= wordLimit) {
    // Log the ticket closure if a logs channel is set up
    if (logsChannelId) {
      const logsChannel = interaction.guild.channels.cache.get(logsChannelId);
      if (logsChannel) {
        const logMessage = new EmbedBuilder()
          .setColor("#baffc9")
          .setTitle("🎫 | Bilietas uždarytas")
          .setDescription(`Bilietas **${channelName}** buvo uždarytas.`) // Use the captured channel name
          .addFields(
            {
              name: "👤 Uždarė",
              value: `<@${interaction.user.id}>`,
              inline: true,
            },
            {
              name: "📄 Priežastis",
              value: reason || "Nenurodyta",
              inline: true,
            },
            {
              name: "⏰ Uždarymo laikas",
              value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
              inline: true,
            }
          )
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setFooter({
            text: "Ada | Ticket System",
            iconURL: interaction.client.user.displayAvatarURL(),
          });

        await logsChannel.send({ embeds: [logMessage], files: [attachment] });
      }
    }
  }

  // Delete the ticket channel
  await interaction.channel.delete();

  // Remove the ticket from the database
  await ticketSchema.deleteOne({ channelId });
}

export default handleCloseTicketReason;
