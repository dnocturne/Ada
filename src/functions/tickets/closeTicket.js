import {
  EmbedBuilder,
  PermissionsBitField,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
} from "discord.js";
import ticketSchema from "../../schemas/tickets/ticketSchema.js";

async function closeTicket(interaction) {
  const channelId = interaction.channel.id;

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

  const supportRoleId = ticket.supportRoleId;

  // Check if the user has permission to close the ticket
  if (
    !interaction.member.roles.cache.has(supportRoleId) &&
    !interaction.member.permissions.has(
      PermissionsBitField.Flags.Administrator
    ) &&
    ticket.userId !== interaction.user.id
  ) {
    const noPermission = new EmbedBuilder()
      .setColor("#FFB3BA")
      .setTitle("❌ | Klaida")
      .setDescription("Jūs neturite teisės uždaryti šio bilieto.")
      .setFooter({
        text: "Ada | Error",
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    return interaction.reply({ embeds: [noPermission], ephemeral: true });
  }

  const contentInput = new TextInputBuilder()
    .setCustomId("content")
    .setLabel("Content")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Bilieto uždarymo priežastis...")
    .setRequired(true);

  const row = new ActionRowBuilder().setComponents(contentInput);

  const modal = new ModalBuilder()
    .setCustomId("closeTicketReason")
    .setTitle("Įrašykite bilieto uždarymo priežastį")
    .setComponents(row);

  interaction.showModal(modal);
}

export default closeTicket;
