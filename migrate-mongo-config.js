// In this file you can configure migrate-mongo
require('dotenv').config();
const mongoose = require('mongoose');


const config = {
  mongodb: {
    url: process.env.MONGODB_URI,
    databaseName: "todoApp",
    options: {
   
    },
  },
  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
  useFileHash: false,
  moduleSystem: "commonjs",
};

module.exports = config;

