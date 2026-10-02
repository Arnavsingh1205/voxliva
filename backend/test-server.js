const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Voxliva test server works 🚀"
  });
});

const PORT = 5001;

app.listen(PORT, "127.0.0.1", () => {
  console.log(`TEST SERVER running on http://127.0.0.1:${PORT}`);
});
