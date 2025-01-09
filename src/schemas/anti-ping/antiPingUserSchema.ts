import mongoose from "mongoose";

const antiPingUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  userMessage: {
    type: String,
    required: true,
  },
  enabled: {
    type: Boolean,
    required: true,
  },
});

export default mongoose.model("AntiPingUser", antiPingUserSchema);
