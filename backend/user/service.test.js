const assert = require("node:assert/strict");
const test = require("node:test");

const modelPath = require.resolve("./model");
const servicePath = require.resolve("./service");
const originalModelModule = require.cache[modelPath];

let User;
let userService;

test.beforeEach(() => {
  User = {
    findAll: async () => [],
  };

  require.cache[modelPath] = {
    id: modelPath,
    filename: modelPath,
    loaded: true,
    exports: User,
  };
  delete require.cache[servicePath];
  userService = require("./service");
});

test.after(() => {
  delete require.cache[servicePath];
  if (originalModelModule) {
    require.cache[modelPath] = originalModelModule;
  } else {
    delete require.cache[modelPath];
  }
});

test("getUsers delegates to User.findAll", async () => {
  const users = [{ id: 1, name: "Maya", surname: "Patel" }];
  let called = false;
  User.findAll = async () => {
    called = true;
    return users;
  };

  const result = await userService.getUsers();

  assert.strictEqual(result, users);
  assert.strictEqual(called, true);
});