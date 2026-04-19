import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    passwordHash: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    createdAt: { type: String },
});

export const User = mongoose.model("User", userSchema);