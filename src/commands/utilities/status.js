import { Slash, execute } from "sunar";
import {
  EmbedBuilder,
  PermissionsBitField,
  StringSelectMenuBuilder,
  ActionRowBuilder,
} from "discord.js";
import ticketSetupSchema from "../../schemas/tickets/ticketSetupSchema.js";
import ticketSettingsSchema from "../../schemas/tickets/ticketSettingsSchema.js";
import ticketCategorySchema from "../../schemas/tickets/ticketCategorySchema.js";
import ticketExtrasSchema from "../../schemas/tickets/ticketExtrasSchema.js";
import antiPingGlobalSettingsSchema from "../../schemas/anti-ping/antiPingGlobalSettingsSchema.js";
import antiPingSettingsSchema from "../../schemas/anti-ping/antiPingSettingsSchema.js";
import antiPingUserSchema from "../../schemas/anti-ping/antiPingUserSchema.js";

const slash = new Slash({
  name: "status",
  description: "Peržiūrėti boto sistemų būseną ir informaciją vienoje vietoje",
  defaultMemberPermissions: [PermissionsBitField.Flags.Administrator],
});

execute(slash, async (interaction) => {
  // Create a dropdown menu for system selection
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("select-system")
    .setPlaceholder("Pasirinkite sistemą")
    .addOptions([
      {
        label: "Bilietų sistema",
        value: "ticket-system",
      },
      {
        label: "Anti Ping sistema",
        value: "antiping-system",
      },
      // Add more systems here if needed
    ]);

  const row = new ActionRowBuilder().addComponents(selectMenu);

  const initialEmbed = new EmbedBuilder()
    .setColor("#baffc9")
    .setTitle("📊 | Pasirinkite sistemą")
    .setDescription("Pasirinkite sistemą iš žemiau esančio meniu.");

  await interaction.reply({
    embeds: [initialEmbed],
    components: [row],
    ephemeral: true,
  });

  // Handle system selection
  const filter = (i) =>
    i.customId === "select-system" && i.user.id === interaction.user.id;
  const collector = interaction.channel.createMessageComponentCollector({
    filter,
    time: 60000,
  });

  collector.on("collect", async (i) => {
    const selectedSystem = i.values[0];
    const guildId = interaction.guild.id;

    if (selectedSystem === "ticket-system") {
      // Fetch ticket setup and settings
      const ticketSetup = await ticketSetupSchema.findOne({ guildId });
      const ticketSettings = await ticketSettingsSchema.findOne({ guildId });
      const ticketCategories = await ticketCategorySchema.find({ guildId });
      const ticketExtrasCount = await ticketExtrasSchema.countDocuments({
        guildId,
      });

      let description = "Bilietų sistema nėra sukonfigūruota.";

      if (ticketSetup && ticketSettings) {
        description =
          `**Bilietų sistema sukonfigūruota**\n\n` +
          `**Kanalas:** <#${ticketSetup.ticketChannelId}>\n` +
          `**Kategorija:** <#${ticketSetup.ticketCategoryId}>\n` +
          `**Bilietų limitas:** ${ticketSettings.ticketLimit}\n` +
          `**Žodžių limitas:** ${ticketSettings.wordLimit}\n` +
          `**Archyvų kanalas:** ${
            ticketSettings.logsChannelId
              ? `<#${ticketSettings.logsChannelId}>`
              : "Nėra"
          }\n` +
          `**Papildomų žinučių kiekis:** ${ticketExtrasCount}\n\n` +
          `**Kategorijos ir jų palaikymo rolės:**\n`;

        ticketCategories.forEach((category) => {
          description += `**${category.categoryName}** - <@&${category.roleId}>\n`;
        });
      }

      const ticketSystemEmbed = new EmbedBuilder()
        .setColor("#baffc9")
        .setTitle("🎫 | Bilietų sistema")
        .setDescription(description);

      await i.update({
        embeds: [ticketSystemEmbed],
        components: [],
        ephemeral: true,
      });
    } else if (selectedSystem === "antiping-system") {
      // Fetch AntiPing settings
      const antiPingGlobalSettings = await antiPingGlobalSettingsSchema.findOne(
        { guildId }
      );
      const antiPingSettings = await antiPingSettingsSchema.find({ guildId });
      const antiPingUsers = await antiPingUserSchema.find({ guildId });

      let description = "AntiPing sistema nėra sukonfigūruota.";

      if (antiPingGlobalSettings) {
        description =
          `**AntiPing sistema sukonfigūruota**\n\n` +
          `**Atsakymo metodas:** ${antiPingGlobalSettings.replyMethod}\n\n` +
          `**Rolės ir jų nustatymai:**\n`;

        antiPingSettings.forEach((setting) => {
          description += `**Prileistos Rolės:** <@&${setting.roleId}>\n`;
        });

        const enabledUsersCount = antiPingUsers.filter(
          (user) => user.enabled
        ).length;

        description += `\n**Vartotojai su įjungta Anti Ping sistema:** ${enabledUsersCount}\n`;
      }

      const antiPingSystemEmbed = new EmbedBuilder()
        .setColor("#baffc9")
        .setTitle("🔕 | Anti Ping sistema")
        .setDescription(description);

      await i.update({
        embeds: [antiPingSystemEmbed],
        components: [],
        ephemeral: true,
      });
    }
  });

  collector.on("end", (collected) => {
    if (collected.size === 0) {
      interaction.editReply({
        content: "Laikas baigėsi, bandykite dar kartą.",
        components: [],
        ephemeral: true,
      });
    }
  });
});

export { slash };
