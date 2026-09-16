const User = require("../user/model");
const Shipment = require("../shipment/model");
const Item = Shipment.Item;
const Event = Shipment.Event;

const seedDatabase = async () => {
  const existingShipmentCount = await Shipment.count();
  if (existingShipmentCount > 0) {
    console.log("Database already contains shipment data; skipping seed.");
    return;
  }

  const users = await User.bulkCreate([
    { name: "Maya", surname: "Patel" },
    { name: "Ethan", surname: "Williams" },
  ]);

  const shipments = await Shipment.bulkCreate(
    [
      {
        address: "12 Oak Avenue, Portland",
        promisedDate: "2026-09-18T17:00:00",
        status: "pending",
        userId: users[0].id,
      },
      {
        address: "88 Market Street, Seattle",
        promisedDate: "2026-09-16T09:30:00",
        status: "in transit",
        userId: users[0].id,
      },
      {
        address: "405 Pine Road, Denver",
        promisedDate: "2026-09-14T14:15:00",
        status: "delivered",
        userId: users[1].id,
      },
      {
        address: "7 Harbor Lane, Boston",
        promisedDate: "2026-09-22T11:45:00",
        status: "at hub",
        userId: users[1].id,
      },
      {
        address: "29 River Road, Austin",
        promisedDate: "2026-09-12T16:30:00",
        status: "pending",
        userId: users[0].id,
      },
      {
        address: "64 Sunset Boulevard, Phoenix",
        promisedDate: "2026-09-16T18:00:00",
        status: "out for delivery",
        userId: users[1].id,
      },
      {
        address: "17 Lakeview Drive, Chicago",
        promisedDate: "2026-09-11T10:00:00",
        status: "in transit",
        userId: users[1].id,
      },
      {
        address: "52 Elm Street, San Francisco",
        promisedDate: "2026-09-19T13:00:00",
        status: "pending",
        userId: users[0].id,
      },
      {
        address: "103 Maple Avenue, Dallas",
        promisedDate: "2026-09-17T15:30:00",
        status: "in transit",
        userId: users[1].id,
      },
      {
        address: "26 Cedar Court, Atlanta",
        promisedDate: "2026-09-20T09:15:00",
        status: "at hub",
        userId: users[0].id,
      },
      {
        address: "71 Birch Road, Miami",
        promisedDate: "2026-09-21T17:45:00",
        status: "out for delivery",
        userId: users[1].id,
      },
      {
        address: "9 Willow Lane, Minneapolis",
        promisedDate: "2026-09-15T08:30:00",
        status: "pending",
        userId: users[0].id,
      },
      {
        address: "144 Spruce Street, Nashville",
        promisedDate: "2026-09-23T12:00:00",
        status: "delivered",
        userId: users[1].id,
      },
      {
        address: "38 Aspen Drive, Salt Lake City",
        promisedDate: "2026-09-18T16:45:00",
        status: "in transit",
        userId: users[0].id,
      },
      {
        address: "215 Walnut Avenue, Charlotte",
        promisedDate: "2026-09-24T10:30:00",
        status: "at hub",
        userId: users[1].id,
      },
      {
        address: "63 Poplar Street, Columbus",
        promisedDate: "2026-09-16T20:00:00",
        status: "out for delivery",
        userId: users[0].id,
      },
      {
        address: "87 Fir Road, Raleigh",
        promisedDate: "2026-09-22T14:00:00",
        status: "pending",
        userId: users[1].id,
      },
      {
        address: "190 Chestnut Lane, Cleveland",
        promisedDate: "2026-09-14T11:30:00",
        status: "delivered",
        userId: users[0].id,
      },
      {
        address: "44 Hawthorn Court, Richmond",
        promisedDate: "2026-09-19T09:45:00",
        status: "in transit",
        userId: users[1].id,
      },
      {
        address: "120 Magnolia Boulevard, New Orleans",
        promisedDate: "2026-09-25T18:30:00",
        status: "at hub",
        userId: users[0].id,
      },
    ],
    { returning: true },
  );

  const items = await Item.bulkCreate(
    [
      { name: "Wireless headphones", quantity: 1 },
      { name: "USB-C charging cable", quantity: 2 },
      { name: "Laptop stand", quantity: 1 },
      { name: "Mechanical keyboard", quantity: 1 },
    ],
    { returning: true },
  );

  await shipments[0].addItems([items[0], items[1]]);
  await shipments[1].addItems([items[1], items[2]]);
  await shipments[2].addItems([items[3]]);
  await shipments[3].addItems([items[0], items[2]]);
  await shipments[4].addItems([items[3]]);
  await shipments[5].addItems([items[1], items[3]]);
  await shipments[6].addItems([items[0], items[2]]);
  await Promise.all(
    shipments
      .slice(7)
      .map((shipment, index) =>
        shipment.addItems([items[index % items.length]]),
      ),
  );

  const eventDefinitions = [
    [["pending", "2026-09-10", "Portland distribution center"]],
    [
      ["pending", "2026-09-11", "Seattle intake facility"],
      ["in transit", "2026-09-12", "Spokane regional hub"],
    ],
    [
      ["pending", "2026-09-09", "Denver intake facility"],
      ["in transit", "2026-09-10", "Cheyenne regional hub"],
      ["at hub", "2026-09-11", "Denver central hub"],
      ["out for delivery", "2026-09-12", "Denver local depot"],
      ["delivered", "2026-09-13", "Denver delivery station"],
    ],
    [
      ["pending", "2026-09-13", "Boston intake facility"],
      ["in transit", "2026-09-14", "Hartford regional hub"],
      ["at hub", "2026-09-15", "Boston central hub"],
    ],
    [["pending", "2026-09-08", "Austin intake facility"]],
    [
      ["pending", "2026-09-13", "Phoenix intake facility"],
      ["in transit", "2026-09-14", "Phoenix regional hub"],
      ["at hub", "2026-09-15", "Phoenix central hub"],
      ["out for delivery", "2026-09-16", "Phoenix local depot"],
    ],
    [
      ["pending", "2026-09-07", "Chicago intake facility"],
      ["in transit", "2026-09-08", "Chicago regional hub"],
    ],
  ];
  const allEventDefinitions = eventDefinitions.concat(
    shipments
      .slice(7)
      .map((shipment) => [[shipment.status, "2026-09-16", shipment.address]]),
  );

  await Event.bulkCreate(
    allEventDefinitions.flatMap((events, shipmentIndex) =>
      events.map(([status, eventDate, address]) => ({
        shipmentId: shipments[shipmentIndex].id,
        status,
        eventDate,
        address,
      })),
    ),
  );

  console.log("Dummy users and shipments created successfully.");
};

module.exports = seedDatabase;
