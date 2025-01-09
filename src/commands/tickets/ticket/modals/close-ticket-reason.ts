import { Modal, execute } from "sunar";
import handleCloseTicketReason from "../../../../functions/tickets/handleCloseTicketReason";
import { MessageFlags } from "discord.js";

const modal = new Modal({ id: "closeTicketReason" });

execute(modal, async (interaction) => {
  try {
    const reason = interaction.fields.getTextInputValue("content");
    await handleCloseTicketReason(interaction, reason);
  } catch (error) {
    console.error('Error in closeTicketReason modal:', error);
    await interaction.reply({ content: 'An error occurred while processing the ticket close reason.', flags: MessageFlags.Ephemeral });
  }
});

export { modal }; 