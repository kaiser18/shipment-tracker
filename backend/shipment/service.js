const Shipment = require("./model");
const User = require("../user/model");
const Item = Shipment.Item;
const Event = Shipment.Event;
const statusSequence = [
  "pending",
  "in transit",
  "at hub",
  "out for delivery",
  "delivered",
];

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

exports.recordShipmentEvent = async (id, eventData) => {
  const shipment = await Shipment.findByPk(id, {
    include: [{ model: Event, as: "events", separate: true }],
  });
  if (!shipment) {
    throw new Error("Shipment not found");
  }

  const currentStatus = shipment.status;
  const nextStatus = statusSequence[statusSequence.indexOf(currentStatus) + 1];
  if (!nextStatus || eventData.status !== nextStatus) {
    throw new Error(`Next shipment status must be ${nextStatus ?? "none"}`);
  }

  const event = await Event.create({
    shipmentId: shipment.id,
    status: nextStatus,
    eventDate: eventData.eventDate,
    address: eventData.address,
  });
  await shipment.update({ status: nextStatus });
  return event;
};
