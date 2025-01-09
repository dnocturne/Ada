import { Group, execute } from "sunar";
import { EmbedBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import antiPingSettingsSchema from "../../../../schemas/anti-ping/antiPingSettingsSchema";

const group = new Group("antiping-settings", "roles", "list");

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

  const guildId = interaction.guild.id;

  // Get all roles from the database
  const roles = await antiPingSettingsSchema.find({
    guildId,
  });

  // If there are no roles in the database
  if (!roles.length) {
    const embed = new EmbedBuilder()
      .setColor("#FFB3BA")
      .setTitle("❌ | Klaida")
      .setDescription(
        "Nėra nustatytų rolių kurios galėtų naudotis anti ping sistema. Šiuo metu tai gali tik asmenys turintys `Administrator` teises."
      )
      .setFooter({
        text: "Ada | Error",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    return;
  }

  // List all roles that can use the anti ping system
  const rolesList = roles.map((role) => {
    return `<@&${role.roleId}>`;
  });

  // Make the embed
  const embed = new EmbedBuilder()
    .setColor("#baffc9")
    .setTitle("📝 | Anti Ping rolių sąrašas")
    .setDescription(rolesList.join("\n"))
    .setFooter({
      text: "Ada | Anti Ping",
      iconURL: interaction.client.user.displayAvatarURL(),
    });
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
});

export { group }; 