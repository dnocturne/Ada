import { Slash, execute, protect } from "sunar";
import { EmbedBuilder } from "discord.js";
import { adminOnly } from "../../protectors/only-admins.js";
import ticketSetupSchema from "../../schemas/tickets/ticketSetupSchema.js";
import ticketSettingsSchema from "../../schemas/tickets/ticketSettingsSchema.js";

const slash = new Slash({
  name: "ticket-settings",
  description: "Konfiguruoti ir keisti bilietų sistemos nustatymus",
  options: [
    {
      name: "logs",
      description: "Kanalas kur bilietų archyvai bus siunčiami",
      type: 1, // Subcommand type
      options: [
        {
          name: "channel",
          description: "Pasirinkite kanalą",
          type: 7, // Channel type
          required: true,
        },
      ],
    },
    {
      name: "ticket-limit",
      description: "Maksimalus bilietų skaičius vienam asmeniui",
      type: 1, // Subcommand type
      options: [
        {
          name: "limit",
          description: "Nustatykite bilietų limitą",
          type: 4, // Integer type
          required: true,
        },
      ],
    },
    {
      name: "word-limit",
      description: "Maksimalus žodžių skaičius biliete",
      type: 1, // Subcommand type
      options: [
        {
          name: "limit",
          description: "Nustatykite žodžių limitą",
          type: 4, // Integer type
          required: true,
        },
      ],
    },
  ],
});

protect(slash, [adminOnly]);

execute(slash, async (interaction) => {
  const { options } = interaction;
  const guildId = interaction.guild.id;

  // Check if the ticket system is setup for the guild. Both Schemas are made during the setup process, so we only check if one exists.
  const ticketSetup = await ticketSetupSchema.findOne({ guildId });

  if (!ticketSetup) {
    const embed = new EmbedBuilder()
      .setColor("#FFB3BA")
      .setTitle("❌ | Klaida")
      .setDescription("Pirmiausiai sukonfigūruokite bilietų sistemą.")
      .setFooter({
        text: "Ada | Error",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    return interaction.reply({
      embed: [embed],
      ephemeral: true,
    });
  }

  // Logs Sub-command - Set logs channel
  if (options.getSubcommand() === "logs") {
    const logsChannelId = interaction.options.get("channel").value;
    await ticketSettingsSchema.updateOne({ guildId }, { logsChannelId });
    // Convert the channel ID to a linkable channel
    const logsChannel = await interaction.guild.channels.fetch(logsChannelId);
    const logsChannelLink = logsChannel.toString();
    // Reply that the logs channel has been updated
    const embed = new EmbedBuilder()
      .setColor("#baffc9")
      .setTitle("✅ | Sėkmingas veiksmas")
      .setDescription(`Bilietų archyvai bus siunčiami į: ${logsChannelLink}`)
      .setFooter({
        text: "Ada | Ticket System",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }
  // Ticket Limit Sub-command - Set ticket limit
  if (options.getSubcommand() === "ticket-limit") {
    const ticketLimit = interaction.options.get("limit").value;
    await ticketSettingsSchema.updateOne({ guildId }, { ticketLimit });
    const embed = new EmbedBuilder()
      .setColor("#baffc9")
      .setTitle("✅ | Sėkmingas veiksmas")
      .setDescription(`Bilietų limitas buvo nustatytas į: ${ticketLimit}`)
      .setFooter({
        text: "Ada | Ticket System",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }
  // Word Limit Sub-command - Set word limit
  if (options.getSubcommand() === "word-limit") {
    const wordLimit = interaction.options.get("limit").value; // Corrected option name
    await ticketSettingsSchema.updateOne({ guildId }, { wordLimit });
    // Reply that the word limit has been updated
    const embed = new EmbedBuilder()
      .setColor("#baffc9")
      .setTitle("✅ | Sėkmingas veiksmas")
      .setDescription(
        `Žodžių limitas bilietuose, jog jį archyvuoti nuo šiol bus: ${wordLimit}`
      )
      .setFooter({
        text: "Ada | Ticket System",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }
});

export { slash };
