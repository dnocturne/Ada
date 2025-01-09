import { Group, execute } from "sunar";
import { EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import ticketCategory from "../../../../../schemas/tickets/ticketCategorySchema";

const group = new Group("ticket-categories", "manage", "create");

execute(group, async (interaction: ChatInputCommandInteraction) => {
  try {
    if (!interaction.guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const name = interaction.options.getString("name", true);
    const role = interaction.options.getRole("role", true);
    const guildId = interaction.guild.id;

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
      return interaction.editReply({ embeds: [embed] });
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
      return interaction.editReply({ embeds: [embed] });
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
        return interaction.editReply({ embeds: [embed] });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in ticket-categories create command:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
    } else {
      await interaction.editReply({ content: 'An error occurred while processing your command.' });
    }
  }
});

export { group }; 