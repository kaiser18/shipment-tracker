const User = require("../user/model");
const Shipment = require("../shipment/model");

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

  await Shipment.bulkCreate([
    {
      address: "12 Oak Avenue, Portland",
      promisedDate: "2026-09-18",
      status: "pending",
      userId: users[0].id,
    },
    {
      address: "88 Market Street, Seattle",
      promisedDate: "2026-09-16",
      status: "in transit",
      userId: users[0].id,
    },
    {
      address: "405 Pine Road, Denver",
      promisedDate: "2026-09-14",
      status: "delivered",
      userId: users[1].id,
    },
    {
      address: "7 Harbor Lane, Boston",
      promisedDate: "2026-09-22",
      status: "pending",
      userId: users[1].id,
    },
  ]);

  console.log("Dummy users and shipments created successfully.");
};

module.exports = seedDatabase;
