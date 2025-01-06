const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRATION || "1hr"; 

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in the environment");
  }

  return jwt.sign(payload, secret, { expiresIn });
};

module.exports = generateToken;