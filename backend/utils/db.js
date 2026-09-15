const Sequelize = require("sequelize");
const dbConfig = require("../configs/db.js");

const sequelize = new Sequelize(
  dbConfig[process.env.NODE_ENV || "development"],
);

const initializeDatabase = async () => {
  await sequelize.sync();
  console.log("✔ Database connected successfully.");
};

module.exports = sequelize;
module.exports.initializeDatabase = initializeDatabase;
