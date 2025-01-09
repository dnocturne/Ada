import mongoose from "mongoose";

const antiPingGlobalSettingsSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
      unique: true,
    },
    replyMethod: {
      type: String,
      enum: ["DM", "sameChannelKeep", "sameChannelDelete"],
      default: "DM",
    },
  },
  {
    timestamps: true, // Adding timestamps to track creation and updates
  }
);

export default mongoose.model(
  "AntiPingGlobalSettings",
  antiPingGlobalSettingsSchema
);
