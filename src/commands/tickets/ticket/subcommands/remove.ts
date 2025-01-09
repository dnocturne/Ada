import { Group, execute } from "sunar";
import { 
  EmbedBuilder, 
  PermissionsBitField,
  ChannelType,
  ChatInputCommandInteraction,
  GuildMember,
  TextChannel,
  MessageFlags,
} from "discord.js";
import ticketSchema from "../../../../schemas/tickets/ticketSchema";

const group = new Group("ticket", "remove");

execute(group, async (interaction: ChatInputCommandInteraction) => {
  try {
    if (!interaction.guild || !interaction.member) {
      await interaction.reply({ content: "This command can only be used in a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const member = interaction.member as GuildMember;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.channel || interaction.channel.type === ChannelType.DM) {
      await interaction.editReply({ 
        content: "This command can only be used in text channels."
      });
      return;
    }

    const removeTicketChannel = interaction.channel as TextChannel;
    if (!removeTicketChannel.name?.startsWith("ticket-")) {
      const notTicketChannel = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Ši komanda gali būti naudojama tik bilietų kanaluose.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [notTicketChannel] });
      return;
    }

    const removeTicketData = await ticketSchema.findOne({
      channelId: removeTicketChannel.id,
    });

    if (!removeTicketData) {
      const noTicket = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Bilietas nerastas.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [noTicket] });
      return;
    }

    const removeTicketSupportRoleId = removeTicketData.supportRoleId;

    if (
      !member.roles.cache.has(removeTicketSupportRoleId) &&
      !member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      const noPermission = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Jūs neturite teisės naudoti šios komandos.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [noPermission] });
      return;
    }

    const removeTargetUser = interaction.options.getUser("user");
    if (!removeTargetUser) {
      await interaction.editReply({ content: "User not found." });
      return;
    }

    const removeTargetMember = await interaction.guild.members.fetch(removeTargetUser.id);
    if (!removeTargetMember) {
      await interaction.editReply({ content: "Member not found in the server." });
      return;
    }

    if (
      member.roles.highest.position <=
      removeTargetMember.roles.highest.position
    ) {
      const sameRole = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription(
          "Negalite pašalinti vartotojo, kuris turi tą patį ar aukštesnę rolę nei jūs."
        )
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [sameRole] });
      return;
    }

    await removeTicketChannel.permissionOverwrites.delete(removeTargetMember);
    
    const userRemoved = new EmbedBuilder()
      .setColor("#baffc9")
      .setTitle("✅ | Vartotojas pašalintas")
      .setDescription(
        `Vartotojas ${removeTargetMember.toString()} buvo pašalintas iš bilieto.`
      )
      .setFooter({
        text: "Ada | Ticket System",
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    await interaction.editReply({ embeds: [userRemoved] });
  } catch (error) {
    console.error('Error in ticket remove command:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'An error occurred while processing your command.', flags: MessageFlags.Ephemeral });
    } else {
      await interaction.editReply({ content: 'An error occurred while processing your command.' });
    }
  }
});

export { group }; 