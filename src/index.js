import dotenv from "dotenv";
import { GatewayIntentBits } from "discord.js";
import { Client, load } from "sunar";

dotenv.config();

const start = async () => {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  });
  await load("src/{commands,signals}/**/*.{js,ts}");

  client.login(process.env.DISCORD_TOKEN);
};

start();
