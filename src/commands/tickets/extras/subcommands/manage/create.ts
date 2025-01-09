import { Group, Modal, execute } from "sunar";
import {
  EmbedBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  MessageFlags,
} from "discord.js";
import ticketExtrasSchema from "../../../../../schemas/tickets/ticketExtrasSchema";
import ticketSetupSchema from "../../../../../schemas/tickets/ticketSetupSchema";
import ticketCategorySchema from "../../../../../schemas/tickets/ticketCategorySchema";

const group = new Group("ticket-extras", "manage", "create");

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
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // Check if ticketSetupSchema exists for the guild
    const ticketSetup = await ticketSetupSchema.findOne({
      guildId: interaction.guild.id,
    });
    if (!ticketSetup) {
      const embed = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Pirmiausiai sukonfigūruokite bilietų sistemą.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // Check if ticket categories exist for the guild
    const ticketCategories = await ticketCategorySchema.find({
      guildId: interaction.guild.id,
    });
    if (!ticketCategories.length) {
      const embed = new EmbedBuilder()
        .setTitle("❌ | Klaida")
        .setDescription("Pirmiausiai sukurkite bilietų kategorijas.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // Ensure the compound index is created if it doesn't exist
    const indexes = await ticketExtrasSchema.collection.indexes();
    const indexExists = indexes.some(
      (index) =>
        index.key.guildId === 1 &&
        index.key.categoryId === 1 &&
        index.key.extrasId === 1
    );
    if (!indexExists) {
      try {
        await ticketExtrasSchema.collection.createIndex(
          { guildId: 1, categoryId: 1, extrasId: 1 },
          { unique: true }
        );
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code !== 11000) {
          throw error; // Rethrow if it's not a duplicate key error
        }
      }
    }

    // Define TextInputBuilder
    const contentInput = new TextInputBuilder()
      .setCustomId("content")
      .setLabel("Content")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Įveskite papildomos žinutės turinį")
      .setRequired(true);

    // Define Row
    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(contentInput);

    // Define modal
    const modal = new ModalBuilder()
      .setCustomId(`ticket-extra-${interaction.options.getString("category")}`)
      .setTitle("Papildoma bilieto žinutė")
      .addComponents(row);

    await interaction.showModal(modal);
  } catch (error) {
    console.error('Error in ticket-extras create command:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'An error occurred while processing your command.', flags: MessageFlags.Ephemeral });
    } else {
      await interaction.editReply({ content: 'An error occurred while processing your command.' });
    }
  }
});

const modal = new Modal({
  id: /^ticket-extra-\d+$/,
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
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // Retrieve the content from the TextInput
    const extrasContent = interaction.fields.getTextInputValue("content");
    // Extract category ID from custom ID
    const customIdParts = interaction.customId.split("-");
    const categoryId = customIdParts[2];
    // Retrieve the guild ID
    const guildId = interaction.guild.id;

    // Check if the inputted category ID exists for the guild
    const category = await ticketCategorySchema.findOne({
      categoryId,
      guildId,
    });
    if (!category) {
      const embed = new EmbedBuilder()
        .setTitle("❌ | Klaida")
        .setDescription("Toks bilietų kategorijos ID neegzistuoja.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // Save the content to the database
    const existingExtra = await ticketExtrasSchema
      .find({ guildId, categoryId })
      .sort({ extrasId: -1 })
      .limit(1);
    const extrasId = existingExtra.length ? existingExtra[0].extrasId + 1 : 1;

    const newExtra = new ticketExtrasSchema({
      guildId,
      categoryId,
      extrasId,
      extrasContent,
    });

    try {
      await newExtra.save();
      const embed = new EmbedBuilder()
        .setColor("#baffc9")
        .setTitle("✅ | Sėkmingas veiksmas")
        .setDescription(
          `Sukurta nauja papildoma žinutė: ${extrasContent} su ID: ${extrasId}`
        )
        .setFooter({
          text: "Ada | Ticket System",
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        const embed = new EmbedBuilder()
          .setColor("#FFB3BA")
          .setTitle("❌ | Klaida")
          .setDescription("Papildoma žinutė su tokiu ID jau egzistuoja.")
          .setFooter({
            text: "Ada | Error",
            iconURL: interaction.client.user.displayAvatarURL(),
          });
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in ticket-extras modal:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'An error occurred while processing your command.', flags: MessageFlags.Ephemeral });
    }
  }
});

export { group, modal }; 