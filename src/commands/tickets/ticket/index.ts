import { Slash } from "sunar";
import { ApplicationCommandOptionType } from "discord.js";

const slash = new Slash({
  name: "ticket",
  description: "Billietų komandos",
  options: [
    {
      name: "open",
      description: "Atidaryti bilietą",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "close",
      description: "Uždaryti bilietą",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "add",
      description: "Pridėti vartotoją prie bilieto",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "Vartotojas, kurį norite pridėti",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
      ],
    },
    {
      name: "remove",
      description: "Pašalinti vartotoją iš bilieto",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "Vartotojas, kurį norite pašalinti",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
      ],
    },
  ],
});

export { slash }; 