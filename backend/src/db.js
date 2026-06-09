import mongoose from "mongoose";

const LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/ideascope";

export async function connectDB() {
  try {
    const uri = process.env.MONGO_URI || LOCAL_MONGO_URI;

    console.log("MongoDB URI:", process.env.MONGO_URI ? "configured" : "using local default");

    await mongoose.connect(uri);

    console.log("MongoDB connected");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
}
