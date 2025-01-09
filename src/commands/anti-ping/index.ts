import { Slash, execute } from "sunar";
import { ApplicationCommandOptionType } from "discord.js";

const slash = new Slash({
  name: "antiping",
  description: "Anti ping system commands",
  options: [
    {
      name: "manage",
      description: "Manage anti ping settings",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "enable",
          description: "Enable anti ping system",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "disable",
          description: "Disable anti ping system",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "view",
          description: "View anti ping message",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "user",
              description: "User whose anti ping message you want to view",
              type: ApplicationCommandOptionType.User,
              required: false,
            },
          ],
        },
      ],
    },
  ],
});

export { slash }; 