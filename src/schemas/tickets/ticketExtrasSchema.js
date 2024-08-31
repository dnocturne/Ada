import mongoose from "mongoose";

const ticketExtrasSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  extrasId: {
    type: String,
    required: true,
    unique: true,
  },
  categoryId: {
    type: String,
    required: true,
  },
  extrasContent: {
    type: String,
    required: true,
  },
});

export default mongoose.model("ticketExtras", ticketExtrasSchema);
