import { Signal, execute } from "sunar";

const signal = new Signal("ready", { once: true });

execute(signal, async (client) => {
  // Cycle through different discord statuses with a configurable:
  // Interval (in milliseconds) to switch between statuses
  // Status Text
  // Status Type (PLAYING, STREAMING, LISTENING, WATCHING)
  // Status URL (only for STREAMING)
  // Status colour (Do not disturb, idle, online, invisible)
});
