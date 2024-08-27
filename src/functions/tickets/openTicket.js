import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
} from "discord.js";
import ticketSchema from "../../schemas/tickets/ticketSchema.js";
import ticketSetupSchema from "../../schemas/tickets/ticketSetupSchema.js";
import TicketCategory from "../../schemas/tickets/ticketCategorySchema.js";

async function openTicket(interaction) {
  const guildId = interaction.guild.id;
  const userId = interaction.user.id; // Get the user ID

  // Check if the ticket system is setup for the guild
  const ticketSetup = await ticketSetupSchema.findOne({ guildId });
  if (!ticketSetup) {
    const noTicketSystem = new EmbedBuilder()
      .setColor("#FFB3BA")
      .setTitle("❌ | Klaida")
      .setDescription("Bilietų sistema šiam serveriui nesukonfigūruota.")
      .setFooter({
        text: "Ada | Error",
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    return interaction.reply({ embeds: [noTicketSystem], ephemeral: true });
  }

  // Fetch available categories
  const categories = await TicketCategory.find({ guildId });
  if (categories.length === 0) {
    const noCategories = new EmbedBuilder()
      .setColor("#FFB3BA")
      .setTitle("❌ | Klaida")
      .setDescription("Nėra sukurtų bilietų kategorijų.")
      .setFooter({
        text: "Ada | Error",
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    return interaction.reply({ embeds: [noCategories], ephemeral: true });
  }

  // Create a dropdown menu for category selection
  const categoryOptions = categories.map((category) => ({
    label: category.categoryName,
    value: category.categoryId,
  }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("select-category")
    .setPlaceholder("Pasirinkite bilietų kategoriją")
    .addOptions(categoryOptions);

  const row = new ActionRowBuilder().addComponents(selectMenu);

  const categorySelectMessage = new EmbedBuilder()
    .setColor("#baffc9")
    .setTitle("🎫 | Pasirinkite bilietų kategoriją")
    .setDescription("Pasirinkite kategoriją iš žemiau esančio meniu.");

  await interaction.reply({
    embeds: [categorySelectMessage],
    components: [row],
    ephemeral: true,
  });

  // Handle category selection
  const filter = (i) =>
    i.customId === "select-category" && i.user.id === interaction.user.id;
  const collector = interaction.channel.createMessageComponentCollector({
    filter,
    time: 60000,
  });

  let interactionHandled = false; // Flag to track if the interaction has been handled

  collector.on("collect", async (i) => {
    if (interactionHandled) return; // If already handled, do nothing
    interactionHandled = true; // Mark as handled

    const selectedCategoryId = i.values[0];
    const selectedCategory = categories.find(
      (category) => category.categoryId === selectedCategoryId
    );

    // Create a new text channel for the ticket
    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: ticketSetup.ticketCategoryId,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
        {
          id: selectedCategory.roleId,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
      ],
    });

    // Save the ticket to the database
    const newTicket = new ticketSchema({
      guildId,
      channelId: ticketChannel.id,
      categoryId: selectedCategoryId,
      userId,
      supportRoleId: selectedCategory.roleId,
    });
    await newTicket.save();

    // Send a confirmation message
    const ticketCreatedMessage = new EmbedBuilder()
      .setColor("#baffc9")
      .setTitle("✅ | Bilietas sukurtas")
      .setDescription(
        `Jūsų bilietas buvo sukurtas: ${ticketChannel.toString()}`
      )
      .setFooter({
        text: "Ada | Ticket System",
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    await i.update({
      embeds: [ticketCreatedMessage],
      components: [],
      ephemeral: true,
    });
  });

  collector.on("end", (collected) => {
    if (collected.size === 0) {
      interaction.editReply({
        content: "Laikas baigėsi, bandykite dar kartą.",
        components: [],
        ephemeral: true,
      });
    }
  });
}

export default openTicket;
