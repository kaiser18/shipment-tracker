const Shipment = require("./model");
const Item = Shipment.Item;

exports.createShipment = async (shipmentData) => {
  return await Shipment.create(shipmentData);
};

exports.getShipments = (query) => {
  const { page = 1, limit = 10 } = query;
  const offset = (page - 1) * limit;
  const filter = {};
  const { status } = query;
  if (status) filter.status = status;
  return Shipment.findAll({
    where: filter,
    limit,
    offset,
    order: [["status", "DESC"]],
  });
};

exports.getShipmentById = (id) => {
  return Shipment.findByPk(id);
};

exports.getItems = () => {
  return Item.findAll();
};

exports.updateShipment = async (id, shipmentData) => {
  const shipment = await Shipment.findByPk(id);
  if (!shipment) {
    throw new Error("Shipment not found");
  }
  return await shipment.update(shipmentData);
};

exports.deleteShipment = async (id) => {
  const shipment = await Shipment.findByPk(id);
  if (!shipment) {
    throw new Error("Shipment not found");
  }
  return await shipment.destroy();
};
