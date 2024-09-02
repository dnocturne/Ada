import { Slash, execute } from "sunar";
import { PermissionsBitField, EmbedBuilder } from "discord.js";
import antiPingSettingsSchema from "../../schemas/anti-ping/antiPingSettingsSchema.js";
import antiPingGlobalSettingsSchema from "../../schemas/anti-ping/antiPingGlobalSettingsSchema.js";

const slash = new Slash({
  name: "antiping-settings",
  description: "Anti ping nustatymų komandos",
  defaultMemberPermissions: [PermissionsBitField.Flags.Administrator],
  options: [
    {
      name: "allow",
      description: "Leisti tam tikrai rolei naudotis anti ping sistema",
      type: 1,
      options: [
        {
          name: "role",
          description: "Rolė kuriai bus leista naudotis anti ping sistema",
          type: 8,
          required: true,
        },
      ],
    },
    {
      name: "disallow",
      description: "Nebeleisti rolei naudotis anti ping sistema",
      type: 1,
      options: [
        {
          name: "role",
          description: "Rolė kuriai nebebus leista naudotis anti ping sistema",
          type: 8,
          required: true,
        },
      ],
    },
    {
      name: "list",
      description: "Rodyti roles kurios gali naudotis anti ping sistema",
      type: 1,
    },
    {
      name: "set-reply-method",
      description: "Nustatyti atsakymo metodą anti ping sistemai",
      type: 1,
      options: [
        {
          name: "method",
          description: "Pasirinkite atsakymo metodą",
          type: 3,
          required: true,
          choices: [
            {
              name: "DM",
              value: "DM",
            },
            {
              name: "Tas pats kanalas (Palikti Anti Ping žinutę)",
              value: "sameChannelKeep",
            },
            {
              name: "Tas pats kanalas (Pašalini Anti Ping žinutę)",
              value: "sameChannelDelete",
            },
          ],
        },
      ],
    },
  ],
});

execute(slash, async (interaction) => {
  const { options } = interaction;
  const guildId = interaction.guild.id;

  if (options.getSubcommand() === "allow") {
    const roleId = options.getRole("role").id;

    // Check if the role is already in the database
    const role = await antiPingSettingsSchema.findOne({
      guildId,
      roleId,
    });

    // Check if the role has the 'Administrator' permission
    const guildRole = interaction.guild.roles.cache.get(roleId);
    const hasAdminPermission = guildRole.permissions.has(
      PermissionsBitField.Flags.Administrator
    );

    if (role || hasAdminPermission) {
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
  }

  if (options.getSubcommand() === "disallow") {
    const roleId = options.getRole("role").id;

    // Check if the role is in the database
    const role = await antiPingSettingsSchema.findOne({
      guildId,
      roleId,
    });
    if (!role) {
      const embed = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Ši rolė nėra pridėta į anti ping sistemos leidimus.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      await interaction.reply({ embeds: [embed], ephemeral: true });
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
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (options.getSubcommand() === "list") {
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
      await interaction.reply({ embeds: [embed], ephemeral: true });
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
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (options.getSubcommand() === "set-reply-method") {
    const method = options.getString("method");

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
  }
});

export { slash };
