import {
  EmbedBuilder,
  PermissionsBitField,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  ChatInputCommandInteraction,
  ButtonInteraction,
  GuildMember,
  InteractionReplyOptions,
  MessageFlags,
} from "discord.js";
import ticketSchema from "../../schemas/tickets/ticketSchema.js";

async function closeTicket(interaction: ChatInputCommandInteraction | ButtonInteraction) {
  if (!interaction.channel) {
    const response: InteractionReplyOptions = { 
      content: "This command can only be used in a channel.", 
      ephemeral: true
    };
    return interaction.deferred ? interaction.editReply(response) : interaction.reply(response);
  }
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

    const response: InteractionReplyOptions = { 
      embeds: [noTicket], 
      ephemeral: true
    };
    return interaction.deferred ? interaction.editReply(response) : interaction.reply(response);
  }

  const supportRoleId = ticket.supportRoleId;

  if (!interaction.member || !(interaction.member instanceof GuildMember)) {
    const response: InteractionReplyOptions = { 
      content: "This command can only be used by server members.", 
      ephemeral: true
    };
    return interaction.deferred ? interaction.editReply(response) : interaction.reply(response);
  }

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

    const response: InteractionReplyOptions = { 
      embeds: [noPermission], 
      flags: MessageFlags.Ephemeral
    };
    return interaction.deferred ? interaction.editReply(response) : interaction.reply(response);
  }

  const contentInput = new TextInputBuilder()
    .setCustomId("content")
    .setLabel("Content")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Bilieto uždarymo priežastis...")
    .setRequired(true);

  const row = new ActionRowBuilder<TextInputBuilder>().setComponents(contentInput);

  const modal = new ModalBuilder()
    .setCustomId("closeTicketReason")
    .setTitle("Įrašykite bilieto uždarymo priežastį")
    .setComponents(row);

  // If the interaction is deferred, we need to edit the reply before showing the modal
  if (interaction.deferred) {
    await interaction.editReply({ 
      content: "Prašome įvesti uždarymo priežastį...",
    });
  }
  
  await interaction.showModal(modal);
}

export default closeTicket;
