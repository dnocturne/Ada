import { Signal, execute, Client } from "sunar";
import { registerCommands } from "sunar/registry";
import mongoose from "mongoose";

const signal = new Signal("ready", { once: true });

execute(signal, async (client: Client) => {
  if (!client.application) return;
  await registerCommands(client.application);
  try {
    await mongoose.connect(process.env.MONGO_DB_URL as string);
  } catch (err) {
    console.log(err);
  }
});

export { signal }; 