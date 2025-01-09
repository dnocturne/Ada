import { Button, execute } from "sunar";
import openTicket from "../../../../functions/tickets/openTicket";

const button = new Button({ id: "openTicket" });

execute(button, async (interaction) => {
  await openTicket(interaction);
});

export { button }; 