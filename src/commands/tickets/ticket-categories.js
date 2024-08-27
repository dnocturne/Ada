import { Slash, protect, execute } from "sunar";
import { EmbedBuilder } from "discord.js";
import { adminOnly } from "../../protectors/only-admins.js";
import TicketCategory from "../../schemas/tickets/ticketCategorySchema.js";

const slash = new Slash({
  name: "ticket-categories",
  description: "Sukurti, redaguoti ir ištrinti bilietų kategorijas",
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
    // Retrieve the name and role of the category
    const name = options.getString("name", true);
    const role = options.getRole("role", true);
    // Retrieve the guild ID
    const guildId = interaction.guild.id;
    // Check if the category by that name already exists
    const existingCategory = await TicketCategory.findOne({
      name,
      guildId,
    });
    // If the category already exists, return an embedded error message
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
    // Create a new category with the provided name and a unique ID starting from 1 as categoryId
    const categoryId = (await TicketCategory.find({ guildId })).length + 1;
    const newCategory = new TicketCategory({
      guildId,
      categoryId,
      categoryName: name,
      roleId: role.id,
    });
    // Save the new category to the database
    await newCategory.save();
    // Return a success message
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
    // Retrieve the category ID
    const categoryId = options.getInteger("id", true);
    // Retrieve the guild ID
    const guildId = interaction.guild.id;
    // Check if the category exists
    const existingCategory = await TicketCategory.findOne({
      categoryId,
      guildId,
    });
    // If the category doesn't exist, return an embedded error message
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
    // Delete the entire category from the database - it's id, guildid, name and role associated with it
    await TicketCategory.deleteOne({ categoryId, guildId });
    // Return a success message
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
    // Retrieve all categories from the database
    const categories = await TicketCategory.find({
      guildId: interaction.guild.id,
    });
    // If there are no categories, return an embedded error message
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
    // Create an embedded message with all the categories
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
