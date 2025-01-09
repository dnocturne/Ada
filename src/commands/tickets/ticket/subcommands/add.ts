import { Group, execute } from "sunar";
import { 
  EmbedBuilder, 
  PermissionsBitField,
  ChannelType,
  ChatInputCommandInteraction,
  GuildMember,
  TextChannel
} from "discord.js";
import ticketSchema from "../../../../schemas/tickets/ticketSchema";

const group = new Group("ticket", "manage", "add");

execute(group, async (interaction: ChatInputCommandInteraction) => {
  try {
    if (!interaction.guild || !interaction.member) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    const member = interaction.member as GuildMember;
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.channel || interaction.channel.type === ChannelType.DM) {
      await interaction.editReply({ 
        content: "This command can only be used in text channels."
      });
      return;
    }

    const addTicketChannel = interaction.channel as TextChannel;
    
    if (!addTicketChannel.name.startsWith("ticket-")) {
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

    const addTicketData = await ticketSchema.findOne({
      channelId: addTicketChannel.id,
    });

    if (!addTicketData) {
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

    const addTicketSupportRoleId = addTicketData.supportRoleId;

    if (
      !member.roles.cache.has(addTicketSupportRoleId) &&
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

    const addTargetUser = interaction.options.getUser("user");
    if (!addTargetUser) {
      await interaction.editReply({ content: "User not found." });
      return;
    }

    const addTargetMember = await interaction.guild.members.fetch(addTargetUser.id);
    if (!addTargetMember) {
      await interaction.editReply({ content: "Member not found in the server." });
      return;
    }

    await addTicketChannel.permissionOverwrites.create(addTargetMember, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });

    const userAdded = new EmbedBuilder()
      .setColor("#baffc9")
      .setTitle("✅ | Vartotojas pridėtas")
      .setDescription(
        `Vartotojas ${addTargetMember.toString()} buvo pridėtas prie bilieto.`
      )
      .setFooter({
        text: "Ada | Ticket System",
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    await interaction.editReply({ embeds: [userAdded] });
  } catch (error) {
    console.error('Error in ticket add command:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
    } else {
      await interaction.editReply({ content: 'An error occurred while processing your command.' });
    }
  }
});

export { group }; 