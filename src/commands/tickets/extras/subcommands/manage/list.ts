import { Group, execute } from "sunar";
import { EmbedBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import ticketExtrasSchema from "../../../../../schemas/tickets/ticketExtrasSchema";
import ticketSetupSchema from "../../../../../schemas/tickets/ticketSetupSchema";
import ticketCategorySchema from "../../../../../schemas/tickets/ticketCategorySchema";

const group = new Group("ticket-extras", "manage", "list");

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
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
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
    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  } catch (error) {
    console.error('Error in ticket-extras list command:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'An error occurred while processing your command.', flags: MessageFlags.Ephemeral });
    } else {
      await interaction.editReply({ content: 'An error occurred while processing your command.' });
    }
  }
});

export { group }; 