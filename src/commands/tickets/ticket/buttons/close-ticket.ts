import { Button, execute } from "sunar";
import closeTicket from "../../../../functions/tickets/closeTicket";

const button = new Button({ id: "closeTicket" });

execute(button, async (interaction) => {
  try {
    await closeTicket(interaction);
  } catch (error) {
    console.error('Error in closeTicket button:', error);
    await interaction.reply({ content: 'An error occurred while closing the ticket.', ephemeral: true });
  }
});

export { button }; 