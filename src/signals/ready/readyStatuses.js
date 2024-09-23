import { Signal, execute } from "sunar";
import { ActivityType } from "discord.js";
import fs from "fs";

const signal = new Signal("ready", { once: true });

execute(signal, async (client) => {
  // Cycles through different discord statuses with a configurable interval and messages.
  // Refer to config.json for the statuses and interval.

  const config = JSON.parse(fs.readFileSync("././config.json"));

  const { interval, statuses } = config.Status;

  let currentIndex = 0;

  // Function to update the bot's status
  const updateStatus = () => {
    const status = statuses[currentIndex];
    client.user.setActivity(status.text, { type: ActivityType[status.type] });
    currentIndex = (currentIndex + 1) % statuses.length;
  };

  // Set the initial status
  updateStatus();

  // Set up the interval to change the status
  setInterval(updateStatus, interval);

  console.log(`Status rotation initialized with ${statuses.length} statuses.`);
});

export { signal };
