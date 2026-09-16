const express = require("express");
const shipmentController = require("./controller");

const router = express.Router();

router
  .route("/")
  .post(shipmentController.addShipment)
  .get(shipmentController.getShipments);

router.route("/items").get(shipmentController.getItems);

router.route("/:id/events").post(shipmentController.recordShipmentEvent);

router.route("/:id").get(shipmentController.getShipmentById);

module.exports = router;
