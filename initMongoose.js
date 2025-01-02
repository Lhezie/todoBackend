const mongoose = require("mongoose");
require("dotenv").config();

global.mongoose = mongoose;

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => console.log("Database connected"))
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });
