import { Slash, protect } from "sunar";
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { adminOnly } from "../../../protectors/only-admins";

const slash = new Slash({
  name: "ticket-extras",
  description: "Sukonfiguruoti bilietų papildymus",
  defaultMemberPermissions: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: "manage",
      description: "Valdyti bilietų papildymus",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "create",
          description: "Pridėti papildomą žinutę į bilietų kategoriją",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "category",
              description: "Kategorijos ID, kuriai pridėsite papildomą žinutę",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
        {
          name: "remove",
          description: "Pašalinti papildomą žinutę iš bilietų kategorijos",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "extra",
              description: "Papildomos žinutės ID, kurią norite pašalinti",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
        {
          name: "list",
          description: "Peržiūrėti visas papildomus žinutes",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
  ],
});

protect(slash, [adminOnly]);

export { slash }; 