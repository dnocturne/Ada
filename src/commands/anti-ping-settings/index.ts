import { Slash } from "sunar";
import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";

const slash = new Slash({
  name: "antiping-settings",
  description: "Anti ping nustatymų komandos",
  defaultMemberPermissions: [PermissionsBitField.Flags.Administrator],
  options: [
    {
      name: "roles",
      description: "Rolių nustatymai",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "allow",
          description: "Leisti tam tikrai rolei naudotis anti ping sistema",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "role",
              description: "Rolė kuriai bus leista naudotis anti ping sistema",
              type: ApplicationCommandOptionType.Role,
              required: true,
            },
          ],
        },
        {
          name: "disallow",
          description: "Nebeleisti rolei naudotis anti ping sistema",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "role",
              description: "Rolė kuriai nebebus leista naudotis anti ping sistema",
              type: ApplicationCommandOptionType.Role,
              required: true,
            },
          ],
        },
        {
          name: "list",
          description: "Rodyti roles kurios gali naudotis anti ping sistema",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
    {
      name: "config",
      description: "Konfigūracijos nustatymai",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "reply-method",
          description: "Nustatyti atsakymo metodą anti ping sistemai",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "method",
              description: "Pasirinkite atsakymo metodą",
              type: ApplicationCommandOptionType.String,
              required: true,
              choices: [
                {
                  name: "DM",
                  value: "DM",
                },
                {
                  name: "Tas pats kanalas (Palikti Anti Ping žinutę)",
                  value: "sameChannelKeep",
                },
                {
                  name: "Tas pats kanalas (Pašalini Anti Ping žinutę)",
                  value: "sameChannelDelete",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});

export { slash }; 