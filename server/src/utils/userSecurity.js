const { createHash, randomBytes } = require("node:crypto");

const createSetupToken = () => {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: createHash("sha256").update(token).digest("hex"),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
};

const hashSetupToken = (token) =>
  createHash("sha256").update(token).digest("hex");

const createSetupUrl = (token) => {
  const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  const setupUrl = new URL("/setup-password", origin);
  setupUrl.searchParams.set("token", token);
  return setupUrl.toString();
};

const toPublicUser = (user) => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  needsPasswordSetup: !user.passwordSetAt,
});

module.exports = {
  createSetupToken,
  createSetupUrl,
  hashSetupToken,
  toPublicUser,
};
