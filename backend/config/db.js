import { createRequire } from "module";

const require = createRequire(import.meta.url);
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/voxliva";

    console.log("Connecting to MongoDB...");

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      family: 4,
    });

    console.log("MongoDB connected successfully ✅");

    return true;
  } catch (error) {
    console.error("MongoDB connection failed ❌");
    console.error("Error:", error.message);

    throw error;
  }
};

export default connectDB;