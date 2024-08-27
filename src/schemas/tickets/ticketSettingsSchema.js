import mongoose from "mongoose";

const ticketSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  logsChannelId: { type: String, required: false },
  ticketLimit: { type: Number, required: true, default: 1 }, // Default of 1
  wordLimit: { type: Number, required: true, default: 0 }, // Default of 0 (no limit)
});

export default mongoose.model("ticketSettings", ticketSettingsSchema);
