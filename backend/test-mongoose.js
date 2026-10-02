console.log("STEP 1: File started");

try {
  const mongoose = await import("mongoose");

  console.log("STEP 2: Mongoose imported ✅");
  console.log("Mongoose version:", mongoose.default.version);

  process.exit(0);
} catch (error) {
  console.error("MONGOOSE IMPORT ERROR ❌");
  console.error(error);
  process.exit(1);
}
