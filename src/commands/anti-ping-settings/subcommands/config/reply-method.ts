import { Group, execute } from "sunar";
import { EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import antiPingGlobalSettingsSchema from "../../../../schemas/anti-ping/antiPingGlobalSettingsSchema";

const group = new Group("antiping-settings", "config", "reply-method");

execute(group, async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.guild) {
    const embed = new EmbedBuilder()
      .setColor("#FFB3BA")
      .setTitle("❌ | Klaida")
      .setDescription("Ši komanda gali būti naudojama tik serveryje.")
      .setFooter({
        text: "Ada | Error",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const guildId = interaction.guild.id;
  const method = interaction.options.getString("method", true);

  // Update the reply method in the global settings database
  await antiPingGlobalSettingsSchema.findOneAndUpdate(
    { guildId },
    { $set: { replyMethod: method } },
    { upsert: true }
  );

  const embed = new EmbedBuilder()
    .setColor("#baffc9")
    .setTitle("✅ | Sėkmingas veiksmas")
    .setDescription(`Atsakymo metodas sėkmingai nustatytas į: ${method}`)
    .setFooter({
      text: "Ada | Anti Ping",
      iconURL: interaction.client.user.displayAvatarURL(),
    });
  await interaction.reply({ embeds: [embed], ephemeral: true });
});

export { group }; 