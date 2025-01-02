const crypto = require("crypto");
const fs = require("fs");
const path = require("path");


// Generate a random JWT secret and save it to a.env file if it doesn't exist already.
const jwtSecret = crypto.randomBytes(32).toString("hex");


const envFilePath = path.join(__dirname, ".env");


const envContent = `JWT_SECRET=${jwtSecret}\n`;

if (!fs.existsSync(envFilePath)) {
  fs.writeFileSync(envFilePath, envContent);
  console.log(".env file created with JWT_SECRET");
} else {
  const envData = fs.readFileSync(envFilePath, "utf8");
  if (!envData.includes("JWT_SECRET")) {
    fs.appendFileSync(envFilePath, envContent);
    console.log("JWT_SECRET added to existing .env file");
  } else {
    console.log(".env file already contains a JWT_SECRET");
  }
}

console.log("Generated JWT_SECRET:", jwtSecret);