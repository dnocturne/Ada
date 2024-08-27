import { Slash, Modal, Button, protect, execute } from "sunar";
import {
  ApplicationCommandOptionType,
  ChannelType,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { adminOnly } from "../../protectors/only-admins.js";
import ticketSetupSchema from "../../schemas/tickets/ticketSetupSchema.js";
import ticketSettingsSchema from "../../schemas/tickets/ticketSettingsSchema.js";
import ticketSchema from "../../schemas/tickets/ticketSchema.js";
import TicketCategory from "../../schemas/tickets/ticketCategorySchema.js";
import openTicket from "../../functions/tickets/openTicket.js";

const slash = new Slash({
  name: "ticket-setup",
  description: "Sukonfiguruoti bilietų sistemą",
  options: [
    {
      name: "create",
      description: "Sukonfiguruoti bilietų sistemą",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "category",
          description: "Kanalų kategorija kurioje bus kuriami bilietų kanalai",
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [ChannelType.GuildCategory],
          required: true,
        },
        {
          name: "channel",
          description: "Kanalas kur bus siunčiama bilietų kūrimo žinutė",
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [ChannelType.GuildText],
          required: true,
        },
      ],
    },
    {
      name: "remove",
      description: "Pašalinti bilietų sistemą",
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
});

protect(slash, [adminOnly]);

execute(slash, async (interaction) => {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "create") {
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
    const row = new ActionRowBuilder().setComponents(contentInput);

    // Define modal
    const modal = new ModalBuilder()
      .setCustomId(`ticket-setup-${channel.id}`)
      .setTitle("Ticket Setup")
      .setComponents(row);

    interaction.showModal(modal);
  } else if (subcommand === "remove") {
    // Remove ticketSchema, ticketSettingsSchema, ticketSetupSchema, ticketCategorySchema data relevant to the guild
    await ticketSetupSchema.deleteOne({ guildId: interaction.guildId });
    await ticketSettingsSchema.deleteOne({ guildId: interaction.guildId });
    await ticketSchema.deleteMany({ guildId: interaction.guildId });
    await TicketCategory.deleteMany({ guildId: interaction.guildId });

    // Send a confirmation
    const embed = new EmbedBuilder()
      .setColor("#baffc9")
      .setTitle("✅ | Sėkmingas veiksmas")
      .setDescription("Bilietų sistema pašalinta.")
      .setFooter({
        text: "Ada | Ticket System",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

const modal = new Modal({
  id: /^ticket-setup-\d+$/, // This regex will match any ID starting with "ticket-setup-" followed by numbers
});

execute(modal, async (interaction) => {
  // Retrieve the content from the text input
  const content = interaction.fields.getTextInputValue("content");

  // Extract channel ID from custom ID
  const customIdParts = interaction.customId.split("-");
  const channelId = customIdParts[2];

  // Fetch the channel
  const channel = await interaction.guild.channels.fetch(channelId);

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

  const row = new ActionRowBuilder().addComponents(openTicketButton);

  channel.send({ embeds: [ticketSystemEmbed], components: [row] });

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
        value: "`/ticket-settings words` Numatyta: 0 (neribota)",
      },
      {
        name: "Archyvų kanalas",
        value: "`/ticket-settings logs` Numatyta: Nėra (Nėra archyvo kanalo)",
      },
      {
        name: "Bilietų limitas vienam vartotojui",
        value:
          "`/ticket-settings limit` Numatyta: 1 (vienas bilietas vienam vartotojui)",
      }
    )
    .setFooter({
      text: "Ada | Ticket System",
      iconURL: interaction.client.user.displayAvatarURL(),
    });

  interaction.reply({
    embeds: [ticketSystemSetup],
    ephemeral: true,
  });
});

const button = new Button({ id: "openTicket" });

execute(button, async (interaction) => {
  await openTicket(interaction);
});

export { slash, modal, button };
