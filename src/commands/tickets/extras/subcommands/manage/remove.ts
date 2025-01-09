import { Group, execute } from "sunar";
import { EmbedBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import ticketExtrasSchema from "../../../../../schemas/tickets/ticketExtrasSchema";
import ticketSetupSchema from "../../../../../schemas/tickets/ticketSetupSchema";
import ticketCategorySchema from "../../../../../schemas/tickets/ticketCategorySchema";

const group = new Group("ticket-extras", "manage", "remove");

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
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // Retrieve the extra ID
    const extraId = interaction.options.getString("extra", true);

    // Check if the extra message exists for the same guild
    const extra = await ticketExtrasSchema.findOne({
      guildId: interaction.guild.id,
      extrasId: extraId,
    });
    if (!extra) {
      const embed = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Tokia papildoma žinutė neegzistuoja.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
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
    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  } catch (error) {
    console.error('Error in ticket-extras remove command:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'An error occurred while processing your command.', flags: MessageFlags.Ephemeral });
    } else {
      await interaction.editReply({ content: 'An error occurred while processing your command.' });
    }
  }
});

export { group }; 