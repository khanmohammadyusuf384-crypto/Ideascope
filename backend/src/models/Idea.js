import mongoose from "mongoose";

const ideaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    workspaceId: {
      type: String,
      default: null,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    problem: {
      type: String,
      required: true,
      trim: true,
    },
    audience: {
      type: String,
      default: "",
      trim: true,
    },
    coreFeatures: {
      type: String,
      required: true,
      trim: true,
    },
    constraints: {
      type: String,
      default: "",
      trim: true,
    },
    source: {
      type: String,
      enum: ["ollama", "local-fallback"],
      required: true,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ideaSchema.index({ userId: 1, createdAt: -1 });

export const Idea = mongoose.model("Idea", ideaSchema);
