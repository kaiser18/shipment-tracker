const cors = require("cors");
const express = require("express");
const shipmentRoutes = require("./shipment");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use("/shipments", shipmentRoutes);
module.exports = app;
