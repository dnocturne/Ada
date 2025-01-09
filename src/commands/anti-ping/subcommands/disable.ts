import { Group, execute } from "sunar";
import { EmbedBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import antiPingUserSchema from "../../../schemas/anti-ping/antiPingUserSchema";

const group = new Group("antiping", "manage", "disable");

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

  const userId = interaction.user.id;
  const guildId = interaction.guild.id;

  const user = await antiPingUserSchema.findOne({ userId, guildId });
  if (!user) {
    const embed = new EmbedBuilder()
      .setColor("#FFB3BA")
      .setTitle("❌ | Klaida")
      .setDescription(
        "Anti ping sistema tau šiuo metu yra neveiksminga, todėl jos išjungti neina."
      )
      .setFooter({
        text: "Ada | Error",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    return;
  }

  await antiPingUserSchema.findOneAndDelete({ userId, guildId });

  const embed = new EmbedBuilder()
    .setColor("#baffc9")
    .setTitle("✅ | Sėkmingas veiksmas")
    .setDescription("Anti ping sistema sėkmingai išjungta jums.")
    .setFooter({
      text: "Ada | Anti Ping",
      iconURL: interaction.client.user.displayAvatarURL(),
    });
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
});

export { group }; 