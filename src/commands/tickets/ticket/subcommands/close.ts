import { Group, execute } from "sunar";
import type { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { MessageFlags } from "discord.js";
import closeTicket from "../../../../functions/tickets/closeTicket";

const group = new Group("ticket", "close");

execute(group, async (interaction: ChatInputCommandInteraction) => {
	try {
		if (!interaction.guild || !interaction.member) {
			await interaction.reply({
				content: "This command can only be used in a server.",
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		const member = interaction.member as GuildMember;

		try {
			await closeTicket(interaction);
		} catch (error) {
			console.error("Error closing ticket:", error);
			if (!interaction.replied && !interaction.deferred) {
				await interaction.reply({
					content:
						"Įvyko klaida bandant uždaryti bilietą. Prašome pranešti administratoriams.",
					flags: MessageFlags.Ephemeral,
				});
			} else {
				await interaction.editReply({
					content:
						"Įvyko klaida bandant uždaryti bilietą. Prašome pranešti administratoriams.",
				});
			}
		}
	} catch (error) {
		console.error("Error in ticket close command:", error);
		if (!interaction.replied && !interaction.deferred) {
			await interaction.reply({
				content: "An error occurred while processing your command.",
				flags: MessageFlags.Ephemeral,
			});
		} else {
			await interaction.editReply({
				content: "An error occurred while processing your command.",
			});
		}
	}
});

export { group };
