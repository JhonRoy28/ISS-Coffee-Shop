const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const argon2 = require("argon2");
const { MongoStore } = require("connect-mongo");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");
const createApp = require("../src/app");
const InventoryItem = require("../src/models/InventoryItem");
const Supplier = require("../src/models/Supplier");
const User = require("../src/models/User");

const CLIENT_ORIGIN = "http://localhost:5173";
const TEST_PASSWORD = "Strong-test-password-123";
const HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

let mongo;
let sessionStore;
let app;

const createUser = async ({ name, email, role, isInitialAdmin = false }) => User.create({
  name,
  email,
  passwordHash: await argon2.hash(TEST_PASSWORD, HASH_OPTIONS),
  passwordSetAt: new Date(),
  role,
  isActive: true,
  isInitialAdmin,
});

const signIn = async (agent, email) => {
  const response = await agent
    .post("/api/auth/login")
    .set("Origin", CLIENT_ORIGIN)
    .send({ email, password: TEST_PASSWORD });
  assert.equal(response.status, 200, response.text);
  return response;
};

before(async () => {
  process.env.NODE_ENV = "test";
  process.env.CLIENT_ORIGIN = CLIENT_ORIGIN;
  process.env.SESSION_SECRET = "isolated-test-session-secret-with-more-than-32-characters";

  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  sessionStore = MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: "test_sessions",
    autoRemove: "disabled",
  });
  app = createApp({ sessionStore });
});

after(async () => {
  if (sessionStore) await sessionStore.close();
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

test("enforces the Admin and Staff permissions and setup lifecycle", async () => {
  const initialAdmin = await createUser({
    name: "Initial Admin",
    email: "initial@example.test",
    role: "admin",
    isInitialAdmin: true,
  });
  const regularAdmin = await createUser({
    name: "Regular Admin",
    email: "admin@example.test",
    role: "admin",
  });
  const staff = await createUser({
    name: "Staff Member",
    email: "staff@example.test",
    role: "staff",
  });

  const anonymous = request.agent(app);
  assert.equal((await anonymous.get("/api/items")).status, 401);
  assert.equal((await anonymous.get("/api/suppliers")).status, 401);
  assert.equal((await anonymous.get("/api/users")).status, 401);

  const blockedOrigin = await request(app)
    .post("/api/auth/login")
    .set("Origin", "https://untrusted.example")
    .send({ email: "initial@example.test", password: TEST_PASSWORD });
  assert.equal(blockedOrigin.status, 403);
  const corsResponse = await request(app)
    .get("/api/auth/me")
    .set("Origin", "https://untrusted.example");
  assert.equal(corsResponse.headers["access-control-allow-origin"], CLIENT_ORIGIN);

  const staffAgent = request.agent(app);
  await signIn(staffAgent, staff.email);
  assert.equal((await staffAgent.get("/api/items")).status, 200);
  assert.equal((await staffAgent.get("/api/suppliers")).status, 200);

  const itemResponse = await staffAgent
    .post("/api/items")
    .set("Origin", CLIENT_ORIGIN)
    .send({
      name: "Permission Test Beans",
      sku: "PERMISSION-TEST-001",
      category: "Coffee Beans",
      quantity: 10,
      unit: "kg",
      unitCost: 400,
      reorderLevel: 3,
      supplier: "Test supplier",
    });
  assert.equal(itemResponse.status, 201, itemResponse.text);
  const itemId = itemResponse.body._id;

  const editResponse = await staffAgent
    .put(`/api/items/${itemId}`)
    .set("Origin", CLIENT_ORIGIN)
    .send({ quantity: 12 });
  assert.equal(editResponse.status, 200, editResponse.text);
  assert.equal(editResponse.body.quantity, 12);
  assert.equal(
    (await staffAgent.delete(`/api/items/${itemId}`).set("Origin", CLIENT_ORIGIN)).status,
    403
  );
  assert.equal(
    (await staffAgent.post("/api/suppliers").set("Origin", CLIENT_ORIGIN).send({ name: "Staff supplier" })).status,
    403
  );
  assert.equal(
    (await staffAgent.put("/api/suppliers/000000000000000000000001").set("Origin", CLIENT_ORIGIN).send({ name: "Blocked" })).status,
    403
  );
  assert.equal(
    (await staffAgent.delete("/api/suppliers/000000000000000000000001").set("Origin", CLIENT_ORIGIN)).status,
    403
  );
  assert.equal((await staffAgent.get("/api/users")).status, 403);
  assert.equal(
    (await staffAgent.post("/api/users/admins").set("Origin", CLIENT_ORIGIN).send({ name: "Blocked", email: "blocked@example.test" })).status,
    403
  );
  assert.equal(
    (await staffAgent.post(`/api/users/${staff._id}/setup-invite`).set("Origin", CLIENT_ORIGIN)).status,
    403
  );

  const adminAgent = request.agent(app);
  await signIn(adminAgent, regularAdmin.email);
  assert.equal((await adminAgent.get("/api/users")).status, 200);
  assert.equal(
    (await adminAgent.post("/api/users/admins").set("Origin", CLIENT_ORIGIN).send({ name: "Blocked Admin", email: "blocked-admin@example.test" })).status,
    404
  );
  assert.equal(
    (await adminAgent.post(`/api/users/${regularAdmin._id}/setup-invite`).set("Origin", CLIENT_ORIGIN)).status,
    404
  );

  const supplierResponse = await adminAgent
    .post("/api/suppliers")
    .set("Origin", CLIENT_ORIGIN)
    .send({ name: "Admin Supplier", email: "supplier@example.test", status: "active" });
  assert.equal(supplierResponse.status, 201, supplierResponse.text);
  const supplierId = supplierResponse.body._id;

  const updateSupplierResponse = await adminAgent
    .put(`/api/suppliers/${supplierId}`)
    .set("Origin", CLIENT_ORIGIN)
    .send({ name: "Updated Admin Supplier" });
  assert.equal(updateSupplierResponse.status, 200, updateSupplierResponse.text);
  assert.equal(updateSupplierResponse.body.name, "Updated Admin Supplier");
  assert.equal(
    (await adminAgent
      .patch(`/api/users/${regularAdmin._id}`)
      .set("Origin", CLIENT_ORIGIN)
      .send({ name: "Should not update Admin" })).status,
    404
  );
  assert.equal(
    (await adminAgent
      .patch(`/api/users/${regularAdmin._id}/status`)
      .set("Origin", CLIENT_ORIGIN)
      .send({ isActive: false })).status,
    404
  );
  assert.equal(
    (await adminAgent.delete(`/api/suppliers/${supplierId}`).set("Origin", CLIENT_ORIGIN)).status,
    200
  );
  assert.equal(
    (await adminAgent.delete(`/api/items/${itemId}`).set("Origin", CLIENT_ORIGIN)).status,
    200
  );

  const createdStaff = await adminAgent
    .post("/api/users")
    .set("Origin", CLIENT_ORIGIN)
    .send({ name: "Invited Staff", email: "invited@example.test", role: "admin" });
  assert.equal(createdStaff.status, 201, createdStaff.text);
  assert.equal(createdStaff.body.user.role, "staff");
  assert.equal(createdStaff.body.user.needsPasswordSetup, true);
  assert.ok(createdStaff.body.setupUrl);
  const updatedStaff = await adminAgent
    .patch(`/api/users/${createdStaff.body.user._id}`)
    .set("Origin", CLIENT_ORIGIN)
    .send({ name: "Invited Staff Updated" });
  assert.equal(updatedStaff.status, 200, updatedStaff.text);
  assert.equal(updatedStaff.body.user.name, "Invited Staff Updated");

  const staffInvite = await adminAgent
    .post(`/api/users/${createdStaff.body.user._id}/setup-invite`)
    .set("Origin", CLIENT_ORIGIN);
  assert.equal(staffInvite.status, 200, staffInvite.text);
  assert.equal(staffInvite.body.user.role, "staff");
  const setupToken = new URL(staffInvite.body.setupUrl).searchParams.get("token");
  const passwordSetup = await request(app)
    .post("/api/auth/setup-password")
    .set("Origin", CLIENT_ORIGIN)
    .send({ token: setupToken, password: "A-new-secure-password-456" });
  assert.equal(passwordSetup.status, 200, passwordSetup.text);
  assert.equal(
    (await request(app)
      .post("/api/auth/setup-password")
      .set("Origin", CLIENT_ORIGIN)
      .send({ token: setupToken, password: "Another-secure-password-789" })).status,
    400
  );

  const initialAdminAgent = await request.agent(app);
  await signIn(initialAdminAgent, initialAdmin.email);
  const initialAdminCreationAttempt = await initialAdminAgent
    .post("/api/users/admins")
    .set("Origin", CLIENT_ORIGIN)
    .send({ name: "Blocked Admin", email: "blocked-admin@example.test" });
  assert.equal(initialAdminCreationAttempt.status, 404);
  assert.equal(
    (await initialAdminAgent
      .post(`/api/users/${regularAdmin._id}/setup-invite`)
      .set("Origin", CLIENT_ORIGIN)).status,
    404
  );
  assert.equal(
    (await initialAdminAgent
      .patch(`/api/users/${regularAdmin._id}`)
      .set("Origin", CLIENT_ORIGIN)
      .send({ name: "Should not update Admin" })).status,
    404
  );

  const expiredAgent = request.agent(app);
  const expiredLogin = await signIn(expiredAgent, regularAdmin.email);
  const sessionCookie = expiredLogin.headers["set-cookie"]
    .find((cookie) => cookie.startsWith("brewstock.sid="));
  assert.ok(sessionCookie);
  const signedSessionId = decodeURIComponent(sessionCookie.split(";", 1)[0].slice("brewstock.sid=".length));
  const sessionId = signedSessionId.slice(2, signedSessionId.lastIndexOf("."));
  const sessionExpiryUpdate = await mongoose.connection.collection("test_sessions")
    .updateOne({ _id: sessionId }, { $set: { expires: new Date(Date.now() - 60_000) } });
  assert.equal(sessionExpiryUpdate.matchedCount, 1);
  assert.equal((await expiredAgent.get("/api/items")).status, 401);

  const deactivateStaff = await adminAgent
    .patch(`/api/users/${staff._id}/status`)
    .set("Origin", CLIENT_ORIGIN)
    .send({ isActive: false });
  assert.equal(deactivateStaff.status, 200, deactivateStaff.text);
  assert.equal((await staffAgent.get("/api/items")).status, 401);

  const userState = await User.findById(staff._id);
  assert.equal(userState.isActive, false);
  assert.equal(await User.countDocuments({ role: "admin" }), 2);
  assert.equal(await InventoryItem.countDocuments(), 0);
  assert.equal(await Supplier.countDocuments(), 0);
});
