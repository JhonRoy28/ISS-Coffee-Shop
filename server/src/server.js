
require("dotenv").config();

const mongoose = require("mongoose");
const { MongoStore } = require("connect-mongo");
const createApp = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const sessionStore = MongoStore.create({
      client: mongoose.connection.getClient(),
      collectionName: "sessions",
      ttl: 8 * 60 * 60,
      autoRemove: "native",
    });
    const app = createApp({ sessionStore });

    app.listen(PORT, () => {
      console.log(`Brewstock API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
