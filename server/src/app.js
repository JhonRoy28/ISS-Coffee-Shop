
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const errorHandler = require("./middleware/errorHandler");
const trustedOrigin = require("./middleware/trustedOrigin");
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const userRoutes = require("./routes/userRoutes");

const SESSION_COOKIE_NAME = "brewstock.sid";

const getClientOrigin = () => {
  const origin = process.env.CLIENT_ORIGIN
    || (process.env.NODE_ENV === "production" ? "" : "http://localhost:5173");
  if (!origin) {
    throw new Error("CLIENT_ORIGIN must be configured in production.");
  }

  let parsedOrigin;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    throw new Error("CLIENT_ORIGIN must be a valid origin.");
  }
  if (
    parsedOrigin.origin !== origin
    || (parsedOrigin.protocol !== "https:" && process.env.NODE_ENV === "production")
  ) {
    throw new Error("CLIENT_ORIGIN must be an exact HTTPS origin in production.");
  }
  return origin;
};

const createApp = ({ sessionStore } = {}) => {
  const sessionSecret = process.env.SESSION_SECRET;
  if (typeof sessionSecret !== "string" || sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }
  if (!sessionStore) {
    throw new Error("A MongoDB-backed session store is required.");
  }

  const clientOrigin = getClientOrigin();
  const app = express();
  const trustProxy = process.env.TRUST_PROXY === "true";

  if (trustProxy) app.set("trust proxy", 1);
  app.use(cors({
    origin: clientOrigin,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }));
  app.use(express.json({ limit: "16kb" }));
  app.use(session({
    name: SESSION_COOKIE_NAME,
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: trustProxy,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,
      path: "/",
    },
  }));
  app.use("/api", trustedOrigin(clientOrigin));

  app.get("/", (req, res) => {
    res.json({ message: "Brewstock API is running!" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/items", inventoryRoutes);
  app.use("/api/suppliers", supplierRoutes);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
module.exports.SESSION_COOKIE_NAME = SESSION_COOKIE_NAME;
