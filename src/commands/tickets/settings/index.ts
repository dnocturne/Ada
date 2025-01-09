import { Slash } from "sunar";
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";

const slash = new Slash({
  name: "ticket-settings",
  description: "Konfiguruoti ir keisti bilietų sistemos nustatymus",
  defaultMemberPermissions: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: "config",
      description: "Pagrindiniai bilietų sistemos nustatymai",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "logs",
          description: "Kanalas kur bilietų archyvai bus siunčiami",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "Pasirinkite kanalą",
              type: ApplicationCommandOptionType.Channel,
              required: true,
            },
          ],
        },
        {
          name: "ticket-limit",
          description: "Maksimalus bilietų skaičius vienam asmeniui",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "limit",
              description: "Nustatykite bilietų limitą",
              type: ApplicationCommandOptionType.Integer,
              required: true,
            },
          ],
        },
        {
          name: "word-limit",
          description: "Maksimalus žodžių skaičius biliete",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "limit",
              description: "Nustatykite žodžių limitą",
              type: ApplicationCommandOptionType.Integer,
              required: true,
            },
          ],
        },
      ],
    },
  ],
});

export { slash }; 