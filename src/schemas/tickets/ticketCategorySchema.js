import mongoose from "mongoose";

const ticketCategorySchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  categoryId: {
    type: String,
    required: true,
    unique: true,
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

export default mongoose.model("ticketCategory", ticketCategorySchema);
