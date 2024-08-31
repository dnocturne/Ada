import mongoose from "mongoose";

const ticketExtrasSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  extrasId: {
    type: String,
    required: true,
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

// Create a compound index to ensure the combination of guildId, categoryId, and extrasId is unique
ticketExtrasSchema.index(
  { guildId: 1, categoryId: 1, extrasId: 1 },
  { unique: true }
);

export default mongoose.model("ticketExtras", ticketExtrasSchema);
