import { Modal, execute } from "sunar";
import { EmbedBuilder } from "discord.js";

const modal = new Modal({
  id: /^ticket-setup-\d+$/, // This regex will match any ID starting with "ticket-setup-" followed by numbers
});

execute(modal, async (interaction) => {
  // Retrieve the content from the text input
  const content = interaction.fields.getTextInputValue("content");

  // Extract channel ID from custom ID
  const customIdParts = interaction.customId.split("-");
  const channelId = customIdParts[2];

  // Fetch the channel
  const channel = await interaction.guild.channels.fetch(channelId);

  // Send the ticket message with the input data
  const ticketSystemEmbed = new EmbedBuilder()
    .setColor("#BAE1FF")
    .setTitle("🙏 Pagalbos Bilietas")
    .setDescription(content || "Sulaukite pagalbos iš mūsų greitai!")
    .setFooter({
      text: "Ada | Ticket System",
      iconURL: interaction.client.user.displayAvatarURL(),
    });
  channel.send({ embeds: [ticketSystemEmbed] });

  // Announce that the ticket system has been setup
  const ticketSystemSetup = new EmbedBuilder()
    .setColor("#BAFFC9")
    .setTitle("✅ | Sėkmingas veiksmas")
    .setDescription(
      "🎉 Jūs sėkmingai paleidote bilietų sistemą! Dabar galite pakeisti keletą nustatymų..."
    )
    .setFields(
      {
        name: "Žodžių limitas archyvuojant bilietus",
        value: "`/ticket-settings words` Numatyta: 0 (neribota)",
      },
      {
        name: "Archyvų kanalas",
        value: "`/ticket-settings logs` Numatyta: Nėra (Nėra archyvo kanalo)",
      },
      {
        name: "Bilietų limitas vienam vartotojui",
        value:
          "`/ticket-settings limit` Numatyta: 1 (vienas bilietas vienam vartotojui)",
      }
    )
    .setFooter({
      text: "Ada | Ticket System",
      iconURL: interaction.client.user.displayAvatarURL(),
    });

  interaction.reply({
    embeds: [ticketSystemSetup],
    ephemeral: true,
  });
});

export { modal };
