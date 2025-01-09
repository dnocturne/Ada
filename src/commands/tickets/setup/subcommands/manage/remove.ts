import { Group, execute } from "sunar";
import { EmbedBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import ticketSetupSchema from "../../../../../schemas/tickets/ticketSetupSchema";
import ticketSettingsSchema from "../../../../../schemas/tickets/ticketSettingsSchema";
import ticketSchema from "../../../../../schemas/tickets/ticketSchema";
import ticketCategory from "../../../../../schemas/tickets/ticketCategorySchema";
import ticketExtrasSchema from "../../../../../schemas/tickets/ticketExtrasSchema";

const group = new Group("ticket-setup", "manage", "remove");

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

    // Remove ticketSchema, ticketSettingsSchema, ticketSetupSchema, ticketCategorySchema, ticketExtraSchema data relevant to the guild
    await ticketSetupSchema.deleteOne({ guildId: interaction.guildId });
    await ticketSettingsSchema.deleteOne({ guildId: interaction.guildId });
    await ticketSchema.deleteMany({ guildId: interaction.guildId });
    await ticketCategory.deleteMany({ guildId: interaction.guildId });
    await ticketExtrasSchema.deleteMany({ guildId: interaction.guildId });

    // Send a confirmation
    const embed = new EmbedBuilder()
      .setColor("#baffc9")
      .setTitle("✅ | Sėkmingas veiksmas")
      .setDescription("Bilietų sistema pašalinta.")
      .setFooter({
        text: "Ada | Ticket System",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  } catch (error) {
    console.error('Error in ticket-setup remove command:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'An error occurred while processing your command.', flags: MessageFlags.Ephemeral });
    } else {
      await interaction.editReply({ content: 'An error occurred while processing your command.' });
    }
  }
});

export { group }; 