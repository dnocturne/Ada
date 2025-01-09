import { Slash, protect } from "sunar";
import { ApplicationCommandOptionType, PermissionFlagsBits, ChannelType } from "discord.js";
import { adminOnly } from "../../../protectors/only-admins";

const slash = new Slash({
  name: "ticket-setup",
  description: "Sukonfiguruoti bilietų sistemą",
  defaultMemberPermissions: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: "manage",
      description: "Valdyti bilietų sistemą",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "create",
          description: "Sukonfiguruoti bilietų sistemą",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "category",
              description: "Kanalų kategorija kurioje bus kuriami bilietų kanalai",
              type: ApplicationCommandOptionType.Channel,
              channelTypes: [ChannelType.GuildCategory],
              required: true,
            },
            {
              name: "channel",
              description: "Kanalas kur bus siunčiama bilietų kūrimo žinutė",
              type: ApplicationCommandOptionType.Channel,
              channelTypes: [ChannelType.GuildText],
              required: true,
            },
          ],
        },
        {
          name: "remove",
          description: "Pašalinti bilietų sistemą",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
  ],
});

protect(slash, [adminOnly]);

export { slash }; 