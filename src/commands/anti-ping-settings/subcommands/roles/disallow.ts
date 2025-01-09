import { Group, execute } from "sunar";
import { EmbedBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import antiPingSettingsSchema from "../../../../schemas/anti-ping/antiPingSettingsSchema";

const group = new Group("antiping-settings", "roles", "disallow");

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
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    return;
  }

  const targetRole = interaction.options.getRole("role");
  if (!targetRole) {
    const embed = new EmbedBuilder()
      .setColor("#FFB3BA")
      .setTitle("❌ | Klaida")
      .setDescription("Rolė nerasta.")
      .setFooter({
        text: "Ada | Error",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    return;
  }

  const guildId = interaction.guild.id;
  const roleId = targetRole.id;

  // Check if the role is in the database
  const existingRole = await antiPingSettingsSchema.findOne({
    guildId,
    roleId,
  });
  if (!existingRole) {
    const embed = new EmbedBuilder()
      .setColor("#FFB3BA")
      .setTitle("❌ | Klaida")
      .setDescription("Ši rolė nėra pridėta į anti ping sistemos leidimus.")
      .setFooter({
        text: "Ada | Error",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    return;
  }

  // Remove the role from the database
  await antiPingSettingsSchema.findOneAndDelete({
    guildId,
    roleId,
  });

  const embed = new EmbedBuilder()
    .setColor("#baffc9")
    .setTitle("✅ | Sėkmingas veiksmas")
    .setDescription("Rolė sėkmingai pašalinta iš anti ping sistemos leidimų.")
    .setFooter({
      text: "Ada | Anti Ping",
      iconURL: interaction.client.user.displayAvatarURL(),
    });
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
});

export { group }; 