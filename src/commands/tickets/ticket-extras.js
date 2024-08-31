import { Slash, Modal, protect, execute } from "sunar";
import {
  EmbedBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  ActionRowBuilder,
  PermissionFlagsBits,
} from "discord.js";
import ticketExtrasSchema from "../../schemas/tickets/ticketExtrasSchema.js";
import ticketSetupSchema from "../../schemas/tickets/ticketSetupSchema.js";
import ticketCategorySchema from "../../schemas/tickets/ticketCategorySchema.js";
import { adminOnly } from "../../protectors/only-admins.js";

const slash = new Slash({
  name: "ticket-extras",
  description: "Sukonfiguruoti bilietų papildymus",
  defaultMemberPermissions: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: "create",
      description: "Pridėti papildomą žinutę į bilietų kategoriją",
      type: 1,
      options: [
        {
          name: "category",
          description: "Kategorijos ID, kuriai pridėsite papildomą žinutę",
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "remove",
      description: "Pašalinti papildomą žinutę iš bilietų kategorijos",
      type: 1,
      options: [
        {
          name: "extra",
          description: "Papildomos žinutės ID, kurią norite pašalinti",
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "list",
      description: "Peržiūrėti visas papildomus žinutes",
      type: 1,
    },
  ],
});

protect(slash, [adminOnly]);

execute(slash, async (interaction) => {
  const { options } = interaction;
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
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
  // Check if ticket categories exist for the guild, because the extras are set to categories.
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
    return interaction.reply({ embeds: [embed], ephemeral: true });
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
      if (error.code !== 11000) {
        throw error; // Rethrow if it's not a duplicate key error
      }
    }
  }

  if (options.getSubcommand() === "create") {
    // Define TextInputBuilder
    const contentInput = new TextInputBuilder()
      .setCustomId("content")
      .setLabel("Content")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Įveskite papildomos žinutės turinį")
      .setRequired(true);

    // Define Row
    const row = new ActionRowBuilder().setComponents(contentInput);

    // Define modal
    const modal = new ModalBuilder()
      .setCustomId(`ticket-extra-${options.getString("category")}`)
      .setTitle("Papildoma bilieto žinutė")
      .setComponents(row);

    interaction.showModal(modal);
  }
  if (options.getSubcommand() === "remove") {
    // Check if any extra messages actually exist for this guild
    const extras = await ticketExtrasSchema.find({
      guildId: interaction.guild.id,
    });
    if (!extras.length) {
      const embed = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription(
          "Nėra jokių nustatytų papildomų žinučių. Nėra ko ir ištrinti."
        )
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    // Retrieve the extra ID
    const extraId = options.getString("extra");
    // Check if the extra message exists for the same guild as extraId is no longer unique.
    const extra = await ticketExtrasSchema.findOne({
      guildId: interaction.guild.id,
      extrasId: extraId,
    });
    if (!extra) {
      const extraExistsEmbed = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Tokia papildoma žinutė neegzistuoja.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      return interaction.reply({ embeds: [extraExistsEmbed], ephemeral: true });
    }
    // Delete the extra message from the database
    await ticketExtrasSchema.deleteOne({
      extrasId: extraId,
      guildId: interaction.guild.id,
    });
    // Return a success message
    const embed = new EmbedBuilder()
      .setColor("#baffc9")
      .setTitle("✅ | Sėkmingas veiksmas")
      .setDescription(`Ištrinta papildoma žinutė su ID: ${extraId}`)
      .setFooter({
        text: "Ada | Ticket System",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
  if (options.getSubcommand() === "list") {
    // Retrieve all extras from the database
    const extras = await ticketExtrasSchema.find({
      guildId: interaction.guild.id,
    });
    // If there are no extras, return an embedded error message
    if (!extras.length) {
      const embed = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Nėra sukurtų papildomų žinučių.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    // Create an embedded message with all the extras
    const embed = new EmbedBuilder()
      .setTitle("📜 | Papildomos žinutės")
      .setDescription(
        extras
          .map(
            (extra) =>
              `ID: ${extra.extrasId} | Kategorijos ID: ${extra.categoryId} | Žinutė: ${extra.extrasContent}`
          )
          .join("\n")
      )
      .setFooter({
        text: "Ada | Ticket System",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

const modal = new Modal({
  id: /^ticket-extra-\d+$/, // This regex will match any ID starting with "ticket-extra-" followed by numbers
});

execute(modal, async (interaction) => {
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
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
  // Save the content to the database, along with guild id, category id, extraId
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
  } catch (error) {
    if (error.code === 11000) {
      const embed = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Papildoma žinutė su tokiu ID jau egzistuoja.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    throw error; // Rethrow if it's not a duplicate key error
  }
  // Return a success message
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
  return interaction.reply({ embeds: [embed], ephemeral: true });
});

export { slash, modal };
