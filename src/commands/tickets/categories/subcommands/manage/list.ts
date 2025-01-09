import { Group, execute } from "sunar";
import { EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import ticketCategory from "../../../../../schemas/tickets/ticketCategorySchema";

const group = new Group("ticket-categories", "manage", "list");

execute(group, async (interaction: ChatInputCommandInteraction) => {
  try {
    if (!interaction.guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

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
      return interaction.editReply({ embeds: [embed] });
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
    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error in ticket-categories list command:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
    } else {
      await interaction.editReply({ content: 'An error occurred while processing your command.' });
    }
  }
});

export { group }; 