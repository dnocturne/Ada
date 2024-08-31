import mongoose from "mongoose";

const ticketCategorySchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  categoryId: {
    type: Number,
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  roleId: {
    type: String,
    required: true,
  },
});

// Create a compound index to ensure the combination of guildId and categoryId is unique
ticketCategorySchema.index({ guildId: 1, categoryId: 1 }, { unique: true });

const ticketCategory = mongoose.model("ticketCategory", ticketCategorySchema);

export default ticketCategory;
