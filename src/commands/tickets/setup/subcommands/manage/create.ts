import { Group, Modal, execute } from "sunar";
import {
  EmbedBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  TextChannel,
} from "discord.js";
import ticketSetupSchema from "../../../../../schemas/tickets/ticketSetupSchema";
import ticketSettingsSchema from "../../../../../schemas/tickets/ticketSettingsSchema";

const group = new Group("ticket-setup", "manage", "create");

execute(group, async (interaction: ChatInputCommandInteraction) => {
  try {
    if (!interaction.guild) {
      const embed = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Ši komanda gali būti naudojama tik serveryje.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Retrieve category and channel for mongodb
    const category = interaction.options.getChannel("category", true);
    const channel = interaction.options.getChannel("channel", true);

    const ticketSystemExists = new EmbedBuilder()
      .setColor("#FFB3BA")
      .setTitle("❌ | Klaida")
      .setDescription("Bilietų sistema jau sukonfigūruota šiam serveriui.")
      .setFooter({
        text: "Ada | Error",
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    // Check if ticketSetup and ticketSettings already exist for the guildId
    const existingTicketSetup = await ticketSetupSchema.findOne({
      guildId: interaction.guildId,
    });
    const existingTicketSettings = await ticketSettingsSchema.findOne({
      guildId: interaction.guildId,
    });

    if (existingTicketSetup && existingTicketSettings) {
      return interaction.reply({
        embeds: [ticketSystemExists],
        ephemeral: true,
      });
    }

    // Save ticket setup settings to the database
    const newTicketSetup = new ticketSetupSchema({
      guildId: interaction.guildId,
      ticketChannelId: channel.id,
      ticketCategoryId: category.id,
    });

    // Populate ticketSettingsSchema with default values
    const newTicketSettings = new ticketSettingsSchema({
      guildId: interaction.guildId,
      logsChannelId: null,
      ticketLimit: 1,
      wordLimit: 0,
    });

    // Save the data to the database
    await newTicketSetup.save();
    await newTicketSettings.save();

    // Define TextInputBuilder
    const contentInput = new TextInputBuilder()
      .setCustomId("content")
      .setLabel("Content")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Įveskite bilieto žinutės norimą turinį")
      .setRequired(true);

    // Define Row
    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(contentInput);

    // Define modal
    const modal = new ModalBuilder()
      .setCustomId(`ticket-setup-${channel.id}`)
      .setTitle("Ticket Setup")
      .addComponents(row);

    await interaction.showModal(modal);
  } catch (error) {
    console.error('Error in ticket-setup create command:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
    } else {
      await interaction.editReply({ content: 'An error occurred while processing your command.' });
    }
  }
});

const modal = new Modal({
  id: /^ticket-setup-\d+$/,
});

execute(modal, async (interaction: ModalSubmitInteraction) => {
  try {
    if (!interaction.guild) {
      const embed = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Ši komanda gali būti naudojama tik serveryje.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Retrieve the content from the text input
    const content = interaction.fields.getTextInputValue("content");

    // Extract channel ID from custom ID
    const customIdParts = interaction.customId.split("-");
    const channelId = customIdParts[2];

    // Fetch the channel
    const channel = await interaction.guild.channels.fetch(channelId);
    if (!channel || !(channel instanceof TextChannel)) {
      const embed = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Nepavyko rasti kanalo.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Send the ticket message with the input data
    const ticketSystemEmbed = new EmbedBuilder()
      .setColor("#BAE1FF")
      .setTitle("🙏 Pagalbos Bilietas")
      .setDescription(content || "Sulaukite pagalbos iš mūsų greitai!")
      .setFooter({
        text: "Ada | Ticket System",
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    // Create the button
    const openTicketButton = new ButtonBuilder()
      .setCustomId("openTicket")
      .setLabel("Atidaryti Bilietą")
      .setStyle(ButtonStyle.Primary);

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(openTicketButton);

    await channel.send({ embeds: [ticketSystemEmbed], components: [buttonRow] });

    // Announce that the ticket system has been setup
    const ticketSystemSetup = new EmbedBuilder()
      .setColor("#BAFFC9")
      .setTitle("✅ | Sėkmingas veiksmas")
      .setDescription(
        "🎉 Jūs sėkmingai paleidote bilietų sistemą! Dabar galite pakeisti keletą nustatymų..."
      )
      .setFields(
        {
          name: "Žodžių limitas archyvuojant bilietus",
          value: "`/ticketsettings word-limit` Numatyta: 0 (neribota)",
        },
        {
          name: "Archyvų kanalas",
          value: "`/ticket-settings logs` Numatyta: Nėra (Nėra archyvo kanalo)",
        },
        {
          name: "Bilietų limitas vienam vartotojui",
          value:
            "`/ticket-settings ticket-limit` Numatyta: 1 (vienas bilietas vienam vartotojui)",
        },
        {
          name: "Taipogi galite pridėti papildomų žinučių siunčiamų į kategorijas",
          value: "`/ticket-extras`",
        }
      )
      .setFooter({
        text: "Ada | Ticket System",
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    await interaction.reply({
      embeds: [ticketSystemSetup],
      ephemeral: true,
    });
  } catch (error) {
    console.error('Error in ticket-setup modal:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
    }
  }
});

export { group, modal }; 