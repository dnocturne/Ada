import { Group, execute } from "sunar";
import { EmbedBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import ticketSetupSchema from "../../../../../schemas/tickets/ticketSetupSchema";
import ticketSettingsSchema from "../../../../../schemas/tickets/ticketSettingsSchema";

const group = new Group("ticket-settings", "config", "logs");

execute(group, async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.guild) {
    return interaction.reply({ content: "This command can only be used in a server.", flags: MessageFlags.Ephemeral });
  }

  const guildId = interaction.guild.id;

  // Check if the ticket system is setup for the guild
  const ticketSetup = await ticketSetupSchema.findOne({ guildId });

  if (!ticketSetup) {
    const embed = new EmbedBuilder()
      .setColor("#FFB3BA")
      .setTitle("❌ | Klaida")
      .setDescription("Pirmiausiai sukonfigūruokite bilietų sistemą.")
      .setFooter({
        text: "Ada | Error",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    return interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  }

  const channel = interaction.options.getChannel("channel");
  if (!channel) return;
  const logsChannelId = channel.id;

  await ticketSettingsSchema.updateOne({ guildId }, { logsChannelId });

  // Convert the channel ID to a linkable channel
  const logsChannel = await interaction.guild.channels.fetch(logsChannelId);
  if (!logsChannel) return;
  const logsChannelLink = logsChannel.toString();

  // Reply that the logs channel has been updated
  const embed = new EmbedBuilder()
    .setColor("#baffc9")
    .setTitle("✅ | Sėkmingas veiksmas")
    .setDescription(`Bilietų archyvai bus siunčiami į: ${logsChannelLink}`)
    .setFooter({
      text: "Ada | Ticket System",
      iconURL: interaction.client.user.displayAvatarURL(),
    });
  return interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });
});

export { group }; 