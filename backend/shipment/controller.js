const shipmentService = require("./service");
const { respondWithError } = require("../utils/response");

const serializeShipment = (shipment) => {
  const data = shipment.toJSON ? shipment.toJSON() : shipment;
  const user = data.user ?? {};

  return {
    ...data,
    destination: data.destination ?? "",
    userName: data.userName ?? user.name ?? "",
    userSurname: data.userSurname ?? user.surname ?? "",
    items: data.items ?? [],
    events: data.events ?? [],
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
    respondWithError(res, 500, "Error creating shipment.", err);
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
    respondWithError(res, 500, "Error retrieving shipments.", err);
  }
};

exports.getShipmentById = async (req, res, next) => {
  try {
    const shipment = await shipmentService.getShipmentById(req.params.id);
    if (!shipment) {
      return respondWithError(res, 404, "Shipment not found.", null);
    }

    res.status(200).json({
      status: "success",
      data: {
        shipment: serializeShipment(shipment),
      },
    });
  } catch (err) {
    respondWithError(res, 500, "Error retrieving shipment.", err);
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
    respondWithError(res, 500, "Error retrieving items.", err);
  }
};

exports.recordShipmentEvent = async (req, res, next) => {
  try {
    const event = await shipmentService.recordShipmentEvent(
      req.params.id,
      req.body,
    );
    res.status(201).json({
      status: "success",
      message: "Shipment event recorded successfully.",
      data: { event },
    });
  } catch (err) {
    const statusCode = err.message === "Shipment not found" ? 404 : 400;
    respondWithError(res, statusCode, err.message, err);
  }
};
