const Shipment = require("./model");
const User = require("../user/model");
const Item = Shipment.Item;
const Event = Shipment.Event;

exports.createShipment = async (shipmentData) => {
  const { itemIds = [], eventAddress, ...shipmentFields } = shipmentData;
  const shipment = await Shipment.create(shipmentFields);

  if (itemIds.length > 0) {
    await shipment.addItems(itemIds);
  }

  await Event.create({
    shipmentId: shipment.id,
    status: shipment.status,
    eventDate: new Date(),
    address: eventAddress ?? "Shipment origin",
  });

  return shipment;
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
    include: [
      { model: Item, as: "items" },
      { model: User, as: "user" },
      {
        model: Event,
        as: "events",
        separate: true,
        order: [["eventDate", "ASC"]],
      },
    ],
  });
};

exports.getShipmentById = (id) => {
  return Shipment.findByPk(id, {
    include: [
      { model: Item, as: "items" },
      { model: User, as: "user" },
      {
        model: Event,
        as: "events",
        separate: true,
        order: [["eventDate", "ASC"]],
      },
    ],
  });
};

exports.getItems = () => {
  return Item.findAll();
};

exports.updateShipment = async (id, shipmentData) => {
  const shipment = await Shipment.findByPk(id);
  if (!shipment) {
    throw new Error("Shipment not found");
  }
  const previousStatus = shipment.status;
  const updatedShipment = await shipment.update(shipmentData);

  if (shipmentData.status && shipmentData.status !== previousStatus) {
    await Event.create({
      shipmentId: shipment.id,
      status: shipmentData.status,
      eventDate: new Date(),
      address: shipmentData.eventAddress ?? "Shipment facility",
    });
  }

  return updatedShipment;
};

exports.deleteShipment = async (id) => {
  const shipment = await Shipment.findByPk(id);
  if (!shipment) {
    throw new Error("Shipment not found");
  }
  return await shipment.destroy();
};
