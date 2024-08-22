import mongoose from "mongoose";

const ticketSetupSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  ticketChannelId: { type: String, required: true },
  ticketCategoryId: { type: String, required: true },
});

export default mongoose.model("ticketSetup", ticketSetupSchema);
