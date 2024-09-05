import { Slash, Modal, execute } from "sunar";
import {
  PermissionsBitField,
  EmbedBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalBuilder,
} from "discord.js";
import antiPingSettingsSchema from "../../schemas/anti-ping/antiPingSettingsSchema.js";
import antiPingUserSchema from "../../schemas/anti-ping/antiPingUserSchema.js";

const slash = new Slash({
  name: "antiping",
  description: "Pagrindinės anti ping komandos",
  options: [
    {
      name: "enable",
      description: "Įjungti anti ping sistemą",
      type: 1,
    },
    {
      name: "disable",
      description: "Išjungti anti ping sistemą",
      type: 1,
    },
    {
      name: "view",
      description: "Peržiūrėti anti ping žinutę",
      type: 1,
      options: [
        {
          name: "user",
          description: "Vartotojas, kurio anti ping žinutę norite peržiūrėti",
          type: 6, // USER type
          required: false,
        },
      ],
    },
  ],
});

execute(slash, async (interaction) => {
  const { options } = interaction;
  const guildId = interaction.guild.id;
  const userId = interaction.member.id;

  if (options.getSubcommand() === "enable") {
    // Check if user has 'Administrator' permission
    if (
      interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      // Show modal for custom message input
      const customMessageInput = new TextInputBuilder()
        .setCustomId("customMessage")
        .setLabel("Įveskite savo anti ping žinutę")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Įveskite savo anti ping žinutę")
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(customMessageInput);

      const modal = new ModalBuilder()
        .setCustomId(`antiping-enable-${userId}`)
        .setTitle("Anti Ping Žinutė")
        .addComponents(row);

      await interaction.showModal(modal);
      return;
    }

    // Fetch allowed roles from the database
    const allowedRoles = await antiPingSettingsSchema.find({ guildId });

    // Check if user has any of the allowed roles
    const hasAllowedRole = allowedRoles.some((role) =>
      interaction.member.roles.cache.has(role.roleId)
    );

    if (hasAllowedRole) {
      // Show modal for custom message input
      const customMessageInput = new TextInputBuilder()
        .setCustomId("customMessage")
        .setLabel("Įveskite savo anti ping žinutę")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Įveskite savo anti ping žinutę")
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(customMessageInput);

      const modal = new ModalBuilder()
        .setCustomId(`antiping-enable-${userId}`)
        .setTitle("Anti Ping Žinutė")
        .addComponents(row);

      await interaction.showModal(modal);
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
  }

  if (options.getSubcommand() === "disable") {
    // Check if the user has it enabled first.
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
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    // Remove user from the database
    await antiPingUserSchema.findOneAndDelete({ userId, guildId });

    const embed = new EmbedBuilder()
      .setColor("#baffc9")
      .setTitle("✅ | Sėkmingas veiksmas")
      .setDescription("Anti ping sistema sėkmingai išjungta jums.")
      .setFooter({
        text: "Ada | Anti Ping",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (options.getSubcommand() === "view") {
    const targetUser = options.getUser("user") || interaction.user;
    const targetUserId = targetUser.id;

    // Fetch the anti-ping message for the specified user
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
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      const embed = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Šis vartotojas neturi nustatytos anti ping žinutės.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
});

const modal = new Modal({
  id: /^antiping-enable-\d+$/, // This regex will match any ID starting with "antiping-enable-" followed by numbers
});

execute(modal, async (interaction) => {
  const userId = interaction.customId.split("-")[2];
  const guildId = interaction.guild.id;
  const customMessage = interaction.fields.getTextInputValue("customMessage");

  // Check if an entry for the user's anti-ping system already exists
  const existingEntry = await antiPingUserSchema.findOne({ userId, guildId });

  if (existingEntry) {
    // Update the existing entry with the new message
    existingEntry.userMessage = customMessage;
    await existingEntry.save();
  } else {
    // Save the user's information in the database
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

export { slash, modal };
