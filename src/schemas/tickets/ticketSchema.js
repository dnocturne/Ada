import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  categoryId: { type: String, required: true },
  userId: { type: String, required: true },
  supportRoleId: { type: String, required: true },
});

export default mongoose.model("ticket", ticketSchema);
