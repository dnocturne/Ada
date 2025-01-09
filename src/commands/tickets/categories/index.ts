import { Slash, protect } from "sunar";
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { adminOnly } from "../../../protectors/only-admins";

const slash = new Slash({
  name: "ticket-categories",
  description: "Sukurti, redaguoti ir ištrinti bilietų kategorijas",
  defaultMemberPermissions: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: "manage",
      description: "Valdyti bilietų kategorijas",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "create",
          description: "Sukurti naują bilietų kategoriją",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "name",
              description: "Kategorijos pavadinimas",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "role",
              description: "Rolė, kuri bus priskirta bilietų kategorijai",
              type: ApplicationCommandOptionType.Role,
              required: true,
            },
          ],
        },
        {
          name: "remove",
          description: "Ištrinti esamą bilietų kategoriją",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "id",
              description: "Bilietų kategorijos ID",
              type: ApplicationCommandOptionType.Integer,
              required: true,
            },
          ],
        },
        {
          name: "list",
          description: "Peržiūrėti visus bilietų kategorijas",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
  ],
});

protect(slash, [adminOnly]);

export { slash }; 