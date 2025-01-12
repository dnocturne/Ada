import {
	EmbedBuilder,
	PermissionsBitField,
	ModalBuilder,
	TextInputBuilder,
	ActionRowBuilder,
	TextInputStyle,
	MessageFlags,
	GuildMember,
} from "discord.js";
import type {
	ChatInputCommandInteraction,
	ButtonInteraction,
	InteractionReplyOptions,
} from "discord.js";
import ticketSchema from "../../schemas/tickets/ticketSchema.js";

async function closeTicket(
	interaction: ChatInputCommandInteraction | ButtonInteraction,
) {
	// If the interaction is already deferred, we can't show a modal
	if (interaction.deferred || interaction.replied) {
		const errorEmbed = new EmbedBuilder()
			.setColor("#FFB3BA")
			.setTitle("❌ | Klaida")
			.setDescription(
				"Įvyko klaida bandant uždaryti bilietą. Prašome bandyti dar kartą.",
			)
			.setFooter({
				text: "Ada | Error",
				iconURL: interaction.client.user.displayAvatarURL(),
			});

		return interaction.editReply({ embeds: [errorEmbed] });
	}

	if (!interaction.channel) {
		return interaction.reply({
			content: "This command can only be used in a channel.",
			ephemeral: true,
		});
	}

	const channelId = interaction.channel.id;

	// Fetch the ticket information from the database
	const ticket = await ticketSchema.findOne({ channelId });
	if (!ticket) {
		const noTicket = new EmbedBuilder()
			.setColor("#FFB3BA")
			.setTitle("❌ | Klaida")
			.setDescription("Bilietas nerastas.")
			.setFooter({
				text: "Ada | Error",
				iconURL: interaction.client.user.displayAvatarURL(),
			});

		return interaction.reply({ embeds: [noTicket], ephemeral: true });
	}

	const supportRoleId = ticket.supportRoleId;

	if (!interaction.member || !(interaction.member instanceof GuildMember)) {
		return interaction.reply({
			content: "This command can only be used by server members.",
			ephemeral: true,
		});
	}

	// Check if the user has permission to close the ticket
	if (
		!interaction.member.roles.cache.has(supportRoleId) &&
		!interaction.member.permissions.has(
			PermissionsBitField.Flags.Administrator,
		) &&
		ticket.userId !== interaction.user.id
	) {
		const noPermission = new EmbedBuilder()
			.setColor("#FFB3BA")
			.setTitle("❌ | Klaida")
			.setDescription("Jūs neturite teisės uždaryti šio bilieto.")
			.setFooter({
				text: "Ada | Error",
				iconURL: interaction.client.user.displayAvatarURL(),
			});

		return interaction.reply({
			embeds: [noPermission],
			flags: MessageFlags.Ephemeral,
		});
	}

	const contentInput = new TextInputBuilder()
		.setCustomId("content")
		.setLabel("Content")
		.setStyle(TextInputStyle.Paragraph)
		.setPlaceholder("Bilieto uždarymo priežastis...")
		.setRequired(true);

	const row = new ActionRowBuilder<TextInputBuilder>().setComponents(
		contentInput,
	);

	const modal = new ModalBuilder()
		.setCustomId("closeTicketReason")
		.setTitle("Įrašykite bilieto uždarymo priežastį")
		.setComponents(row);

	await interaction.showModal(modal);
}

export default closeTicket;
