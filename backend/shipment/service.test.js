const assert = require("node:assert/strict");
const test = require("node:test");

const modelPath = require.resolve("./model");
const userModelPath = require.resolve("../user/model");
const servicePath = require.resolve("./service");
const originalModelModule = require.cache[modelPath];
const originalUserModelModule = require.cache[userModelPath];

let Shipment;
let User;
let shipmentService;

test.beforeEach(() => {
  Shipment = {
    create: async () => undefined,
    findAll: async () => [],
    findByPk: async () => undefined,
  };
  Shipment.Item = {
    findAll: async () => [],
  };
  Shipment.Event = {
    create: async () => undefined,
  };
  User = {};

  require.cache[modelPath] = {
    id: modelPath,
    filename: modelPath,
    loaded: true,
    exports: Shipment,
  };
  require.cache[userModelPath] = {
    id: userModelPath,
    filename: userModelPath,
    loaded: true,
    exports: User,
  };
  delete require.cache[servicePath];
  shipmentService = require("./service");
});

test.after(() => {
  delete require.cache[servicePath];
  if (originalModelModule) {
    require.cache[modelPath] = originalModelModule;
  } else {
    delete require.cache[modelPath];
  }
  if (originalUserModelModule) {
    require.cache[userModelPath] = originalUserModelModule;
  } else {
    delete require.cache[userModelPath];
  }
});

test("createShipment delegates to Shipment.create", async () => {
  const shipmentData = {
    address: "12 Main Street",
    promisedDate: "2026-09-20",
  };
  const createdShipment = { id: 1, ...shipmentData };
  let receivedData;
  Shipment.create = async (data) => {
    receivedData = data;
    return createdShipment;
  };

  const result = await shipmentService.createShipment(shipmentData);

  assert.strictEqual(result, createdShipment);
  assert.deepStrictEqual(receivedData, shipmentData);
});

test("createShipment associates selected items", async () => {
  const shipment = { addItems: async () => undefined };
  const shipmentData = {
    address: "12 Main Street",
    promisedDate: "2026-09-20",
    userId: 1,
    itemIds: [2, 3],
  };
  let receivedData;
  let receivedItems;
  Shipment.create = async (data) => {
    receivedData = data;
    return shipment;
  };
  shipment.addItems = async (items) => {
    receivedItems = items;
  };

  const result = await shipmentService.createShipment(shipmentData);

  assert.strictEqual(result, shipment);
  assert.deepStrictEqual(receivedData, {
    address: "12 Main Street",
    promisedDate: "2026-09-20",
    userId: 1,
  });
  assert.deepStrictEqual(receivedItems, [2, 3]);
});

test("createShipment records the initial status event", async () => {
  const shipment = {
    id: 8,
    status: "pending",
    addItems: async () => undefined,
  };
  let eventData;
  Shipment.create = async () => shipment;
  Shipment.Event.create = async (data) => {
    eventData = data;
    return data;
  };

  await shipmentService.createShipment({
    address: "12 Main Street",
    promisedDate: "2026-09-20",
    userId: 1,
    eventAddress: "Origin warehouse",
  });

  assert.strictEqual(eventData.shipmentId, 8);
  assert.strictEqual(eventData.status, "pending");
  assert.strictEqual(eventData.address, "Origin warehouse");
  assert.ok(eventData.eventDate instanceof Date);
});

test("getShipments applies status, pagination, and descending status order", async () => {
  const shipments = [{ id: 2, status: "pending" }];
  let options;
  Shipment.findAll = async (queryOptions) => {
    options = queryOptions;
    return shipments;
  };

  const result = await shipmentService.getShipments({
    page: 3,
    limit: 5,
    status: "pending",
  });

  assert.strictEqual(result, shipments);
  assert.deepStrictEqual(options, {
    where: { status: "pending" },
    limit: 5,
    offset: 10,
    order: [["status", "DESC"]],
    include: [
      { model: Shipment.Item, as: "items" },
      { model: User, as: "user" },
      {
        model: Shipment.Event,
        as: "events",
        separate: true,
        order: [["eventDate", "ASC"]],
      },
    ],
  });
});

test("getShipments uses defaults and an empty filter when no status is provided", async () => {
  let options;
  Shipment.findAll = async (queryOptions) => {
    options = queryOptions;
    return [];
  };

  await shipmentService.getShipments({});

  assert.deepStrictEqual(options, {
    where: {},
    limit: 10,
    offset: 0,
    order: [["status", "DESC"]],
    include: [
      { model: Shipment.Item, as: "items" },
      { model: User, as: "user" },
      {
        model: Shipment.Event,
        as: "events",
        separate: true,
        order: [["eventDate", "ASC"]],
      },
    ],
  });
});

test("getShipmentById delegates to Shipment.findByPk", async () => {
  const shipment = { id: 7 };
  let receivedId;
  let receivedOptions;
  Shipment.findByPk = async (id, options) => {
    receivedId = id;
    receivedOptions = options;
    return shipment;
  };

  const result = await shipmentService.getShipmentById(7);

  assert.strictEqual(result, shipment);
  assert.strictEqual(receivedId, 7);
  assert.deepStrictEqual(receivedOptions, {
    include: [
      { model: Shipment.Item, as: "items" },
      { model: User, as: "user" },
      {
        model: Shipment.Event,
        as: "events",
        separate: true,
        order: [["eventDate", "ASC"]],
      },
    ],
  });
});

test("recordShipmentEvent records only the next status and updates the shipment", async () => {
  const shipment = {
    id: 7,
    status: "in transit",
    update: async (data) => {
      shipment.status = data.status;
      return shipment;
    },
  };
  let eventData;
  Shipment.findByPk = async () => shipment;
  Shipment.Event.create = async (data) => {
    eventData = data;
    return { id: 3, ...data };
  };

  const result = await shipmentService.recordShipmentEvent(7, {
    status: "at hub",
    address: "Spokane regional hub",
    eventDate: "2026-09-16T10:00:00.000Z",
  });

  assert.deepStrictEqual(result, {
    id: 3,
    shipmentId: 7,
    status: "at hub",
    address: "Spokane regional hub",
    eventDate: "2026-09-16T10:00:00.000Z",
  });
  assert.strictEqual(shipment.status, "at hub");
  assert.deepStrictEqual(eventData, {
    shipmentId: 7,
    status: "at hub",
    address: "Spokane regional hub",
    eventDate: "2026-09-16T10:00:00.000Z",
  });
});

test("recordShipmentEvent rejects a status that skips the next step", async () => {
  Shipment.findByPk = async () => ({ id: 7, status: "pending" });

  await assert.rejects(
    shipmentService.recordShipmentEvent(7, {
      status: "at hub",
      address: "Spokane regional hub",
      eventDate: "2026-09-16T10:00:00.000Z",
    }),
    { message: "Next shipment status must be in transit" },
  );
});

test("recordShipmentEvent rejects events after delivery", async () => {
  Shipment.findByPk = async () => ({ id: 7, status: "delivered" });

  await assert.rejects(
    shipmentService.recordShipmentEvent(7, {
      status: "delivered",
      address: "Delivery station",
      eventDate: "2026-09-16T10:00:00.000Z",
    }),
    { message: "Next shipment status must be none" },
  );
});

test("updateShipment records an event when the status changes", async () => {
  const shipment = {
    id: 4,
    status: "at hub",
    update: async (data) => {
      shipment.status = data.status;
      return shipment;
    },
  };
  let eventData;
  Shipment.findByPk = async () => shipment;
  Shipment.Event.create = async (data) => {
    eventData = data;
    return data;
  };

  await shipmentService.updateShipment(4, {
    status: "out for delivery",
    eventAddress: "Local delivery depot",
  });

  assert.deepStrictEqual(eventData, {
    shipmentId: 4,
    status: "out for delivery",
    address: "Local delivery depot",
    eventDate: eventData.eventDate,
  });
  assert.ok(eventData.eventDate instanceof Date);
});

test("getItems delegates to Item.findAll", async () => {
  const items = [{ id: 1, name: "Wireless headphones", quantity: 1 }];
  let called = false;
  Shipment.Item.findAll = async () => {
    called = true;
    return items;
  };

  const result = await shipmentService.getItems();

  assert.strictEqual(result, items);
  assert.strictEqual(called, true);
});

test("updateShipment updates an existing shipment", async () => {
  const shipment = { update: async () => undefined };
  const shipmentData = { status: "delivered" };
  let receivedId;
  let receivedData;
  Shipment.findByPk = async (id) => {
    receivedId = id;
    return shipment;
  };
  shipment.update = async (data) => {
    receivedData = data;
    return { ...shipment, ...data };
  };

  const result = await shipmentService.updateShipment(4, shipmentData);

  assert.deepStrictEqual(result, {
    update: shipment.update,
    status: "delivered",
  });
  assert.strictEqual(receivedId, 4);
  assert.strictEqual(receivedData, shipmentData);
});

test("updateShipment throws when the shipment does not exist", async () => {
  Shipment.findByPk = async () => null;

  await assert.rejects(
    shipmentService.updateShipment(99, { status: "delivered" }),
    { message: "Shipment not found" },
  );
});

test("deleteShipment destroys an existing shipment", async () => {
  let destroyed = false;
  const shipment = {
    destroy: async () => {
      destroyed = true;
    },
  };
  Shipment.findByPk = async () => shipment;

  const result = await shipmentService.deleteShipment(5);

  assert.strictEqual(result, undefined);
  assert.strictEqual(destroyed, true);
});

test("deleteShipment throws when the shipment does not exist", async () => {
  Shipment.findByPk = async () => null;

  await assert.rejects(shipmentService.deleteShipment(99), {
    message: "Shipment not found",
  });
});
