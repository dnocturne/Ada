import mongoose from "mongoose";

const antiPingSettingsSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
      index: true,
    },
    roleId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true, // Adding timestamps to track creation and updates
  }
);

export default mongoose.model("AntiPingSettings", antiPingSettingsSchema);
