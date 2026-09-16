const shipmentService = require("./service");

const serializeShipment = (shipment) => {
  const data = shipment.toJSON ? shipment.toJSON() : shipment;
  const user = data.user ?? {};

  return {
    ...data,
    destination: data.destination ?? data.address ?? "",
    userName: data.userName ?? user.name ?? "",
    userSurname: data.userSurname ?? user.surname ?? "",
    items: data.items ?? [],
  };
};

exports.addShipment = async (req, res, next) => {
  try {
    const shipmentData = req.body;
    const newShipment = await shipmentService.createShipment(shipmentData);
    res.status(200).json({
      status: "success",
      message: "Shipment created successfully.",
      data: {
        newShipment,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: "error", message: "Error creating shipment." });
  }
};

exports.getShipments = async (req, res, next) => {
  try {
    const shipments = await shipmentService.getShipments(req.query);
    res.status(200).json({
      status: "success",
      data: {
        shipments: shipments.map(serializeShipment),
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: "error", message: "Error retrieving shipments." });
  }
};

exports.getShipmentById = async (req, res, next) => {
  try {
    const shipment = await shipmentService.getShipmentById(req.params.id);
    if (!shipment) {
      return res
        .status(404)
        .json({ status: "error", message: "Shipment not found." });
    }

    res.status(200).json({
      status: "success",
      data: {
        shipment: serializeShipment(shipment),
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: "error", message: "Error retrieving shipment." });
  }
};

exports.getItems = async (req, res, next) => {
  try {
    const items = await shipmentService.getItems();
    res.status(200).json({
      status: "success",
      data: {
        items,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: "error", message: "Error retrieving items." });
  }
};

exports.updateShipment = async (req, res, next) => {
  try {
    const shipmentData = req.body;
    const updatedShipment = await shipmentService.updateShipment(
      req.params.id,
      shipmentData,
    );
    res.status(200).json({
      status: "success",
      message: "Shipment updated successfully.",
      data: {
        updatedShipment,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: "error", message: "Error updating shipment." });
  }
};

exports.deleteShipment = async (req, res, next) => {
  try {
    await shipmentService.deleteShipment(req.params.id);
    res.status(200).json({
      status: "success",
      message: "Shipment deleted successfully.",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: "error", message: "Error deleting shipment." });
  }
};
