const http = require("http");
require("dotenv").config();
const app = require("./app");
const sequelize = require("./utils/db");
const seedDatabase = require("./utils/seed");

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.initializeDatabase();
    await seedDatabase();
    server.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  } catch (err) {
    console.error("✘ Error starting the server:", err);
    process.exitCode = 1;
  }
};

startServer();
