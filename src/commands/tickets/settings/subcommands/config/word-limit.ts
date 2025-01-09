import { Group, execute } from "sunar";
import { EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import ticketSetupSchema from "../../../../../schemas/tickets/ticketSetupSchema";
import ticketSettingsSchema from "../../../../../schemas/tickets/ticketSettingsSchema";

const group = new Group("ticket-settings", "config", "word-limit");

execute(group, async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.guild) {
    return interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
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
      ephemeral: true,
    });
  }

  const wordLimit = interaction.options.getInteger("limit", true);

  await ticketSettingsSchema.updateOne({ guildId }, { wordLimit });

  const embed = new EmbedBuilder()
    .setColor("#baffc9")
    .setTitle("✅ | Sėkmingas veiksmas")
    .setDescription(
      `Žodžių limitas bilietuose, jog jį archyvuoti nuo šiol bus: ${wordLimit}`
    )
    .setFooter({
      text: "Ada | Ticket System",
      iconURL: interaction.client.user.displayAvatarURL(),
    });
  return interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });
});

export { group }; 