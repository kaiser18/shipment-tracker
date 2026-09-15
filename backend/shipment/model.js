const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db"); // Import the database connection
const Shipment = sequelize.define(
  "shipment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    promisedDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "pending",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    paranoid: true, // Enables soft deletes
  },
);

Shipment.belongsTo(require("../user/model"), { foreignKey: "userId" });

module.exports = Shipment;
