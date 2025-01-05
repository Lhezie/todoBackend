const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
});

async function up() {
  try {
    const usersCollection = mongoose.connection.collection("users");

    // Create unique index for email
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    console.log("Unique index on email created.");
  } catch (error) {
    console.error("Error in up migration:", error);
  } finally {
    mongoose.disconnect();
  }
}

async function down() {
  try {
    const usersCollection = mongoose.connection.collection("users");

    // Drop the index on email
    await usersCollection.dropIndex("email_1");

    console.log("Unique index on email dropped.");
  } catch (error) {
    console.error("Error in down migration:", error);
  } finally {
    mongoose.disconnect();
  }
}

module.exports = { up, down };
