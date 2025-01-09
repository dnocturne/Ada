import { Client, load } from "sunar";
import { GatewayIntentBits } from "discord.js";

const start = async () => {

	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
			GatewayIntentBits.GuildMembers,
		],
	});

	await load("src/{commands,signals}/**/*.{js,ts}");
	await client.login(process.env.DISCORD_TOKEN);
};

start().catch(console.error);