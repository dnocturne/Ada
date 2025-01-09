import { Group, execute } from "sunar";
import { EmbedBuilder, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import antiPingSettingsSchema from "../../../../schemas/anti-ping/antiPingSettingsSchema";

const group = new Group("antiping-settings", "roles", "allow");

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

  const role = interaction.options.getRole("role");
  if (!role) {
    const embed = new EmbedBuilder()
      .setColor("#FFB3BA")
      .setTitle("❌ | Klaida")
      .setDescription("Rolė nerasta.")
      .setFooter({
        text: "Ada | Error",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const guildId = interaction.guild.id;
  const roleId = role.id;

  // Check if the role is already in the database
  const roleInDb = await antiPingSettingsSchema.findOne({
    guildId,
    roleId,
  });

  // Check if the role has the 'Administrator' permission
  const guildRole = interaction.guild.roles.cache.get(roleId);
  if (!guildRole) {
    const embed = new EmbedBuilder()
      .setColor("#FFB3BA")
      .setTitle("❌ | Klaida")
      .setDescription("Rolė nerasta serveryje.")
      .setFooter({
        text: "Ada | Error",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const hasAdminPermission = guildRole.permissions.has(
    PermissionsBitField.Flags.Administrator
  );

  if (roleInDb || hasAdminPermission) {
    const embed = new EmbedBuilder()
      .setColor("#FFB3BA")
      .setTitle("❌ | Klaida")
      .setDescription(
        "Ši rolė jau yra anti ping sistemoje arba turi `'Administrator'` leidimą ir jos pridėti nebereikia."
      )
      .setFooter({
        text: "Ada | Error",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  // If the role is not in the database and doesn't have 'Administrator' permission, add it
  await new antiPingSettingsSchema({
    guildId,
    roleId,
  }).save();

  const embed = new EmbedBuilder()
    .setColor("#baffc9")
    .setTitle("✅ | Sėkmingas veiksmas")
    .setDescription(
      "Rolė sėkmingai pridėta ir gali naudotis anti ping sistema."
    )
    .setFooter({
      text: "Ada | Anti Ping",
      iconURL: interaction.client.user.displayAvatarURL(),
    });
  await interaction.reply({ embeds: [embed], ephemeral: true });
});

export { group }; 