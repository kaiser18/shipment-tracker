const Shipment = require("./model");
const User = require("../user/model");
const Item = Shipment.Item;
const Event = Shipment.Event;
const sequelize = Shipment.sequelize;
const statusSequence = [
  "pending",
  "in transit",
  "at hub",
  "out for delivery",
  "delivered",
];

function getNextShipmentStatus(currentStatus) {
  const currentIndex = statusSequence.indexOf(currentStatus);
  return currentIndex === -1 ? null : (
      (statusSequence[currentIndex + 1] ?? null)
    );
}

function assertValidShipmentStatusTransition(currentStatus, nextStatus) {
  const expectedStatus = getNextShipmentStatus(currentStatus);

  if (!expectedStatus) {
    throw new Error("Next shipment status must be none");
  }

  if (nextStatus !== expectedStatus) {
    throw new Error(`Next shipment status must be ${expectedStatus}`);
  }
}

exports.getNextShipmentStatus = getNextShipmentStatus;
exports.assertValidShipmentStatusTransition =
  assertValidShipmentStatusTransition;

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
  return sequelize.transaction(async (transaction) => {
    const shipment = await Shipment.findByPk(id, {
      include: [{ model: Event, as: "events", separate: true }],
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    if (!shipment) {
      throw new Error("Shipment not found");
    }

    const nextStatus = getNextShipmentStatus(shipment.status);
    assertValidShipmentStatusTransition(shipment.status, eventData.status);

    const event = await Event.create(
      {
        shipmentId: shipment.id,
        status: nextStatus,
        eventDate: eventData.eventDate,
        address: eventData.address,
      },
      { transaction },
    );

    await shipment.update({ status: nextStatus }, { transaction });
    return event;
  });
};
