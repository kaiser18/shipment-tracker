const cors = require("cors");
const express = require("express");
const shipmentRoutes = require("./shipment");
const userRoutes = require("./user");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use("/shipments", shipmentRoutes);
app.use("/users", userRoutes);
module.exports = app;
