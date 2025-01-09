import { Group, execute } from "sunar";
import { EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import ticketCategory from "../../../../../schemas/tickets/ticketCategorySchema";

const group = new Group("ticket-categories", "manage", "remove");

execute(group, async (interaction: ChatInputCommandInteraction) => {
  try {
    if (!interaction.guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const categoryId = interaction.options.getInteger("id", true);
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
      return interaction.editReply({ embeds: [embed] });
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
    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error in ticket-categories remove command:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
    } else {
      await interaction.editReply({ content: 'An error occurred while processing your command.' });
    }
  }
});

export { group }; 