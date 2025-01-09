import { Group, Modal, execute } from "sunar";
import {
  PermissionsBitField,
  EmbedBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalBuilder,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  GuildMember,
} from "discord.js";
import antiPingSettingsSchema from "../../../schemas/anti-ping/antiPingSettingsSchema";
import antiPingUserSchema from "../../../schemas/anti-ping/antiPingUserSchema";

const group = new Group("antiping", "manage", "enable");

execute(group, async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.guild || !interaction.member || !(interaction.member instanceof GuildMember)) {
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
  const member = interaction.member;
  const userId = member.user.id;

  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    await showAntiPingModal(interaction, userId);
    return;
  }

  const allowedRoles = await antiPingSettingsSchema.find({ guildId });
  const hasAllowedRole = allowedRoles.some((role) => member.roles.cache.has(role.roleId));

  if (hasAllowedRole) {
    await showAntiPingModal(interaction, userId);
  } else {
    const embed = new EmbedBuilder()
      .setColor("#FFB3BA")
      .setTitle("❌ | Klaida")
      .setDescription("Neturite leidimo naudotis anti ping sistema.")
      .setFooter({
        text: "Ada | Error",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

async function showAntiPingModal(interaction: ChatInputCommandInteraction, userId: string) {
  const customMessageInput = new TextInputBuilder()
    .setCustomId("customMessage")
    .setLabel("Įveskite savo anti ping žinutę")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Įveskite savo anti ping žinutę")
    .setRequired(true);

  const row = new ActionRowBuilder<TextInputBuilder>().addComponents(customMessageInput);

  const modal = new ModalBuilder()
    .setCustomId(`antiping-enable-${userId}`)
    .setTitle("Anti Ping Žinutė")
    .addComponents(row);

  await interaction.showModal(modal);
}

const modal = new Modal({
  id: /^antiping-enable-\d+$/,
});

execute(modal, async (interaction: ModalSubmitInteraction) => {
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

  const userId = interaction.customId.split("-")[2];
  const guildId = interaction.guild.id;
  const customMessage = interaction.fields.getTextInputValue("customMessage");

  const existingEntry = await antiPingUserSchema.findOne({ userId, guildId });

  if (existingEntry) {
    existingEntry.userMessage = customMessage;
    await existingEntry.save();
  } else {
    await new antiPingUserSchema({
      userId,
      guildId,
      userMessage: customMessage,
      enabled: true,
    }).save();
  }

  const embed = new EmbedBuilder()
    .setColor("#baffc9")
    .setTitle("✅ | Sėkmingas veiksmas")
    .setDescription("Anti ping sistema sėkmingai įjungta.")
    .setFooter({
      text: "Ada | Anti Ping",
      iconURL: interaction.client.user.displayAvatarURL(),
    });
  await interaction.reply({ embeds: [embed], ephemeral: true });
});

export { group, modal }; 