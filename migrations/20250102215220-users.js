const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/Users"); 
 


mongoose.connect(process.env.MONGODB_URI, {
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
});

async function up() {
  try {
    // Ensure the User model is ready
    const usersCollection = mongoose.connection.collection("users");

    // Add index for email field if it doesn't exist
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    console.log("Users collection modified with necessary indexes.");
  } catch (error) {
    console.error("Error in up migration:", error);
  }
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down() {
  try {
    // Drop the index on email if it was created in the up function
    const usersCollection = mongoose.connection.collection("users");

    // Check existing indexes and drop the 'email_1' index (or update with correct name if different)
    await usersCollection.dropIndex("email_1");

    console.log("Users collection index dropped.");
  } catch (error) {
    console.error("Error in down migration:", error);
  }
}

module.exports = { up, down };