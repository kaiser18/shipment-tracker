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
      type: DataTypes.ENUM(
        "pending",
        "in transit",
        "at hub",
        "out for delivery",
        "delivered",
      ),
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

Shipment.belongsTo(require("../user/model"), {
  as: "user",
  foreignKey: "userId",
});

const Item = sequelize.define("Item", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

Shipment.belongsToMany(Item, { as: "items", through: "ShipmentItems" });
Item.belongsToMany(Shipment, { as: "shipments", through: "ShipmentItems" });

const ShipmentEvent = sequelize.define("ShipmentEvent", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.ENUM(
      "pending",
      "in transit",
      "at hub",
      "out for delivery",
      "delivered",
    ),
    allowNull: false,
  },
  eventDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});

Shipment.hasMany(ShipmentEvent, { as: "events", foreignKey: "shipmentId" });
ShipmentEvent.belongsTo(Shipment, { as: "shipment", foreignKey: "shipmentId" });

module.exports = Shipment;
module.exports.Item = Item;
module.exports.Event = ShipmentEvent;
