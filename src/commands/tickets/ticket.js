import { Slash, Button, Modal, execute } from "sunar";
import { EmbedBuilder, PermissionsBitField } from "discord.js";
import ticketSchema from "../../schemas/tickets/ticketSchema.js";
import openTicket from "../../functions/tickets/openTicket.js";
import closeTicket from "../../functions/tickets/closeTicket.js";
import handleCloseTicketReason from "../../functions/tickets/handleCloseTicketReason.js";

const slash = new Slash({
  name: "ticket",
  description: "Billietų komandos",
  options: [
    {
      name: "open",
      description: "Atidaryti bilietą",
      type: 1,
    },
    {
      name: "close",
      description: "Uždaryti bilietą",
      type: 1,
    },
    {
      name: "add",
      description: "Pridėti vartotoją prie bilieto",
      type: 1,
      options: [
        {
          name: "user",
          description: "Vartotojas, kurį norite pridėti",
          type: 6, // Assuming type 6 for user
        },
      ],
    },
    {
      name: "remove",
      description: "Pašalinti vartotoją iš bilieto",
      type: 1,
      options: [
        {
          name: "user",
          description: "Vartotojas, kurį norite pašalinti",
          type: 6, // Assuming type 6 for user
        },
      ],
    },
  ],
});

execute(slash, async (interaction) => {
  const { options } = interaction;

  if (options.getSubcommand() === "open") {
    // Execute the openTicket function
    openTicket(interaction);
  }
  if (options.getSubcommand() === "close") {
    // Execute the closeTicket function
    closeTicket(interaction);
  }
  if (options.getSubcommand() === "add") {
    // Check if the command is used in a ticket channel called "ticket-"
    if (!interaction.channel.name.startsWith("ticket-")) {
      const notTicketChannel = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Ši komanda gali būti naudojama tik bilietų kanaluose.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      return interaction.reply({ embeds: [notTicketChannel], ephemeral: true });
    }

    // Fetch the ticket information from the database
    const ticket = await ticketSchema.findOne({
      channelId: interaction.channel.id,
    });

    if (!ticket) {
      const noTicket = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Bilietas nerastas.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      return interaction.reply({ embeds: [noTicket], ephemeral: true });
    }

    const supportRoleId = ticket.supportRoleId;

    if (
      !interaction.member.roles.cache.has(supportRoleId) &&
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      const noPermission = new EmbedBuilder()
        .setColor("#FFB3BA")
        .setTitle("❌ | Klaida")
        .setDescription("Jūs neturite teisės naudoti šios komandos.")
        .setFooter({
          text: "Ada | Error",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      return interaction.reply({ embeds: [noPermission], ephemeral: true });
    }

    // Add the user to the ticket to see the channels
    const user = options.getUser("user");
    const member = interaction.guild.members.cache.get(user.id);
    const ticketChannel = interaction.channel;
    ticketChannel.permissionOverwrites.create(member, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });
    const userAdded = new EmbedBuilder()
      .setColor("#baffc9")
      .setTitle("✅ | Vartotojas pridėtas")
      .setDescription(
        `Vartotojas ${member.toString()} buvo pridėtas prie bilieto.`
      )
      .setFooter({
        text: "Ada | Ticket System",
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    // Send the confirmation message
    interaction.reply({ embeds: [userAdded] });
  }
  if (options.getSubcommand() === "remove") {
    if (options.getSubcommand() === "remove") {
      // Check if the command is used in a ticket channel called "ticket-"
      if (!interaction.channel.name.startsWith("ticket-")) {
        const notTicketChannel = new EmbedBuilder()
          .setColor("#FFB3BA")
          .setTitle("❌ | Klaida")
          .setDescription(
            "Ši komanda gali būti naudojama tik bilietų kanaluose."
          )
          .setFooter({
            text: "Ada | Error",
            iconURL: interaction.client.user.displayAvatarURL(),
          });

        return interaction.reply({
          embeds: [notTicketChannel],
          ephemeral: true,
        });
      }

      // Fetch the ticket information from the database
      const ticket = await ticketSchema.findOne({
        channelId: interaction.channel.id,
      });

      if (!ticket) {
        const noTicket = new EmbedBuilder()
          .setColor("#FFB3BA")
          .setTitle("❌ | Klaida")
          .setDescription("Bilietas nerastas.")
          .setFooter({
            text: "Ada | Error",
            iconURL: interaction.client.user.displayAvatarURL(),
          });

        return interaction.reply({ embeds: [noTicket], ephemeral: true });
      }

      const supportRoleId = ticket.supportRoleId;

      if (
        !interaction.member.roles.cache.has(supportRoleId) &&
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      ) {
        const noPermission = new EmbedBuilder()
          .setColor("#FFB3BA")
          .setTitle("❌ | Klaida")
          .setDescription("Jūs neturite teisės naudoti šios komandos.")
          .setFooter({
            text: "Ada | Error",
            iconURL: interaction.client.user.displayAvatarURL(),
          });

        return interaction.reply({ embeds: [noPermission], ephemeral: true });
      }

      // Check if the user being removed has the same role as the user issuing the command
      const user = options.getUser("user");
      const member = interaction.guild.members.cache.get(user.id);

      if (
        interaction.member.roles.highest.position <=
        member.roles.highest.position
      ) {
        const sameRole = new EmbedBuilder()
          .setColor("#FFB3BA")
          .setTitle("❌ | Klaida")
          .setDescription(
            "Negalite pašalinti vartotojo, kuris turi tą patį ar aukštesnę rolę nei jūs."
          )
          .setFooter({
            text: "Ada | Error",
            iconURL: interaction.client.user.displayAvatarURL(),
          });

        return interaction.reply({ embeds: [sameRole], ephemeral: true });
      }

      // Remove the user from the ticket
      const ticketChannel = interaction.channel;
      ticketChannel.permissionOverwrites.delete(member);
      const userRemoved = new EmbedBuilder()
        .setColor("#baffc9")
        .setTitle("✅ | Vartotojas pašalintas")
        .setDescription(
          `Vartotojas ${member.toString()} buvo pašalintas iš bilieto.`
        )
        .setFooter({
          text: "Ada | Ticket System",
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      // Send the confirmation message
      interaction.reply({ embeds: [userRemoved] });
    }
  }
});

const button = new Button({ id: "closeTicket" });

execute(button, (interaction) => {
  // Execute the closeTicket function
  closeTicket(interaction);
});

const modal = new Modal({ id: "closeTicketReason" });

execute(modal, (interaction) => {
  const reason = interaction.fields.getTextInputValue("content");
  handleCloseTicketReason(interaction, reason); // Use the new function
});

export { slash, button, modal };
