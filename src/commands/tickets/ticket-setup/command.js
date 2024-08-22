import { Slash, protect, execute } from "sunar";
import {
  ApplicationCommandOptionType,
  ChannelType,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  EmbedBuilder,
} from "discord.js";
import { adminOnly } from "../../../protectors/only-admins.js";
import ticketSetupSchema from "../../../schemas/tickets/ticketSetupSchema.js";
import ticketSettingsSchema from "../../../schemas/tickets/ticketSettingsSchema.js";

const slash = new Slash({
  name: "ticket-setup",
  description: "Sukonfiguruoti bilietų sistemą",
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
});

protect(slash, [adminOnly]);

execute(slash, (interaction) => {
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
  const existingTicketSetup = ticketSetupSchema.findOne({
    guildId: interaction.guildId,
  });
  const existingTicketSettings = ticketSettingsSchema.findOne({
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
  newTicketSetup.save();
  newTicketSettings.save();

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
});

export { slash };
