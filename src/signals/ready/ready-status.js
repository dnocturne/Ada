import { Signal, execute } from "sunar";

const signal = new Signal("ready", { once: true });

execute(signal, async (client) => {
  console.log(`Logged in as ${client.user.tag}`);
});

export { signal };
