import { Group, execute } from "sunar";
import { EmbedBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import antiPingUserSchema from "../../../schemas/anti-ping/antiPingUserSchema";

const group = new Group("antiping", "manage", "view");

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

  const targetUser = interaction.options.getUser("user") || interaction.user;
  const targetUserId = targetUser.id;
  const guildId = interaction.guild.id;

  const antiPingUser = await antiPingUserSchema.findOne({
    userId: targetUserId,
    guildId,
  });

  if (antiPingUser) {
    const embed = new EmbedBuilder()
      .setColor("#baffc9")
      .setTitle("✅ | Anti Ping Žinutė")
      .setDescription(antiPingUser.userMessage)
      .setFooter({
        text: "Ada | Anti Ping",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  } else {
    const embed = new EmbedBuilder()
      .setColor("#FFB3BA")
      .setTitle("❌ | Klaida")
      .setDescription("Šis vartotojas neturi nustatytos anti ping žinutės.")
      .setFooter({
        text: "Ada | Error",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
});

export { group }; 