import { Slash, protect, execute } from "sunar";
import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { adminOnly } from "../../protectors/only-admins.js";
import ticketCategory from "../../schemas/tickets/ticketCategorySchema.js";

const slash = new Slash({
  name: "ticket-categories",
  description: "Sukurti, redaguoti ir ištrinti bilietų kategorijas",
  defaultMemberPermissions: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: "create",
      description: "Sukurti naują bilietų kategoriją",
      type: 1,
      options: [
        {
          name: "name",
          description: "Kategorijos pavadinimas",
          type: 3,
          required: true,
        },
        {
          name: "role",
          description: "Rolė, kuri bus priskirta bilietų kategorijai",
          type: 8,
          required: true,
        },
      ],
    },
    {
      name: "remove",
      description: "Ištrinti esamą bilietų kategoriją",
      type: 1,
      options: [
        {
          name: "id",
          description: "Bilietų kategorijos ID",
          type: 4,
          required: true,
        },
      ],
    },
    {
      name: "list",
      description: "Peržiūrėti visus bilietų kategorijas",
      type: 1,
    },
  ],
});

protect(slash, [adminOnly]);

execute(slash, async (interaction) => {
  const { options } = interaction;

  if (options.getSubcommand() === "create") {
    const name = options.getString("name", true);
    const role = options.getRole("role", true);
    const guildId = interaction.guild.id;

    // Check if the compound index already exists
    const indexes = await ticketCategory.collection.indexes();
    const indexExists = indexes.some(
      (index) => index.key.guildId === 1 && index.key.categoryId === 1
    );

    // Ensure the compound index is created if it doesn't exist
    if (!indexExists) {
      try {
        await ticketCategory.collection.createIndex(
          { guildId: 1, categoryId: 1 },
          { unique: true }
        );
      } catch (error) {
        if (error.code !== 11000) {
          throw error; // Rethrow if it's not a duplicate key error
        }
      }
    }

    const existingCategory = await ticketCategory.findOne({
      categoryName: name,
      guildId,
    });

    if (existingCategory) {
      const embed = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Tokia bilietų kategorija jau egzistuoja.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const highestCategory = await ticketCategory
      .find({ guildId })
      .sort({ categoryId: -1 })
      .limit(1);

    const categoryId = highestCategory.length
      ? highestCategory[0].categoryId + 1
      : 1;

    const newCategory = new ticketCategory({
      guildId,
      categoryId,
      categoryName: name,
      roleId: role.id,
    });

    try {
      await newCategory.save();
    } catch (error) {
      if (error.code === 11000) {
        const embed = new EmbedBuilder()
          .setColor("#FFB3BA")
          .setTitle("❌ | Klaida")
          .setDescription("Kategorija su tokiu ID jau egzistuoja.")
          .setFooter({
            text: "Ada | Error",
            iconURL: interaction.client.user.displayAvatarURL(),
          });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
      throw error; // Rethrow if it's not a duplicate key error
    }

    const embed = new EmbedBuilder()
      .setColor("#baffc9")
      .setTitle("✅ | Sėkmingas veiksmas")
      .setDescription(
        `Sukurta nauja bilietų kategorija: ${name} su ID: ${categoryId}`
      )
      .setFooter({
        text: "Ada | Ticket System",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (options.getSubcommand() === "remove") {
    const categoryId = options.getInteger("id", true);
    const guildId = interaction.guild.id;

    const existingCategory = await ticketCategory.findOne({
      categoryId,
      guildId,
    });

    if (!existingCategory) {
      const embed = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Tokia bilietų kategorija neegzistuoja.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    await ticketCategory.deleteOne({ categoryId, guildId });

    const embed = new EmbedBuilder()
      .setColor("#baffc9")
      .setTitle("✅ | Sėkmingas veiksmas")
      .setDescription(`Ištrinta bilietų kategorija su ID: ${categoryId}`)
      .setFooter({
        text: "Ada | Ticket System",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (options.getSubcommand() === "list") {
    const categories = await ticketCategory.find({
      guildId: interaction.guild.id,
    });

    if (!categories.length) {
      const embed = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Nėra sukurtų bilietų kategorijų.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor("#baffc9")
      .setTitle("Bilietų kategorijos")
      .setDescription(
        categories
          .map(
            (category) =>
              `ID: ${category.categoryId} | Pavadinimas: ${category.categoryName} | Rolė: <@&${category.roleId}>`
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

export { slash };
