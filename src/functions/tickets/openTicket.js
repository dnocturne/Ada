import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import ticketSchema from "../../schemas/tickets/ticketSchema.js";
import ticketSetupSchema from "../../schemas/tickets/ticketSetupSchema.js";
import ticketCategory from "../../schemas/tickets/ticketCategorySchema.js";
import ticketSettingsSchema from "../../schemas/tickets/ticketSettingsSchema.js";
import ticketExtrasSchema from "../../schemas/tickets/ticketExtrasSchema.js";

async function openTicket(interaction) {
  // Create the close ticket button
  const closeTicketButton = new ButtonBuilder()
    .setCustomId("closeTicket")
    .setLabel("Uždaryti bilietą")
    .setStyle(ButtonStyle.Danger);

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

  // Fetch ticket settings
  const ticketSettings = await ticketSettingsSchema.findOne({ guildId });
  const ticketLimit = ticketSettings ? ticketSettings.ticketLimit : 1;

  // Check if the user already has tickets
  const userTickets = await ticketSchema.find({
    guildId,
    userId,
  });

  // Compare the number of tickets with the ticket limit
  if (userTickets.length >= ticketLimit) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      const ticketLimitMessage = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription(
          `Šis asmuo jau turi ${userTickets.length} atidarytų bilietų ir viršijo limitą, tačiau yra administratorius ir jam negalioja limitas.`
        )
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      return interaction.reply({
        embeds: [ticketLimitMessage],
        ephemeral: true,
      });
    }
  }

  // Fetch available categories
  const categories = await ticketCategory.find({ guildId });
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
    value: category.categoryId.toString(), // Ensure categoryId is a string
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
      (category) =>
        category.categoryId.toString() === selectedCategoryId.toString()
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

    // Send a message to the ticket channel
    const ticketChannelMessage = new EmbedBuilder()
      .setColor("#baffc9")
      .setTitle("🎫 | Bilietas atidarytas")
      .setDescription(
        `Sveiki, ${interaction.user.toString()}! Prašome aprašyti savo problemą, kad mes galėtume jums padėti.`
      )
      .addFields(
        {
          name: "Pagalbos kategorija",
          value: selectedCategory.categoryName,
        },
        {
          name: "Pagalbos agentai",
          value: `<@&${selectedCategory.roleId}>`,
        }
      )
      .setFooter({
        text: "Ada | Ticket System",
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    const row = new ActionRowBuilder().addComponents(closeTicketButton);

    await ticketChannel.send({
      embeds: [ticketChannelMessage],
      components: [row],
    });

    // Fetch and send extras if they exist for the selected category
    const extras = await ticketExtrasSchema.find({
      guildId,
      categoryId: selectedCategoryId,
    });
    if (extras.length > 0) {
      for (const extra of extras) {
        const extraMessage = new EmbedBuilder()
          .setColor("#baffc9")
          .setTitle("📄 | Papildoma informacija")
          .setDescription(extra.extrasContent)
          .setFooter({
            text: "Ada | Ticket System",
            iconURL: interaction.client.user.displayAvatarURL(),
          });

        await ticketChannel.send({ embeds: [extraMessage] });
      }
    }

    // If the user is an admin and exceeded the ticket limit, send a warning message in the ticket channel
    if (
      userTickets.length >= ticketLimit &&
      interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      const adminWarningMessage = new EmbedBuilder()
        .setColor("#ffdfba")
        .setTitle("⚠️ | Įspėjimas")
        .setDescription(
          `Šis asmuo jau turi ${userTickets.length} atidarytų bilietų ir viršijo limitą, tačiau yra administratorius ir limitas jam negalioja!`
        )
        .setFooter({
          text: "Ada | Warning",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      await ticketChannel.send({ embeds: [adminWarningMessage] });
    }
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
