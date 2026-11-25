require("dotenv").config();

const readline = require("node:readline");
const mongoose = require("mongoose");
const argon2 = require("argon2");
const User = require("../models/User");

const PASSWORD_HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 1,
};

const promptLine = async (message) => {
  const interfaceInstance = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    return await new Promise((resolve) => {
      interfaceInstance.question(message, (answer) => resolve(answer.trim()));
    });
  } finally {
    interfaceInstance.close();
  }
};

const promptHidden = (message) => new Promise((resolve, reject) => {
  const input = process.stdin;
  if (!input.isTTY || typeof input.setRawMode !== "function") {
    reject(new Error("Run the Admin setup from an interactive terminal."));
    return;
  }

  let value = "";
  const finish = (error) => {
    input.removeListener("data", onData);
    input.setRawMode(false);
    input.pause();
    process.stdout.write("\n");
    if (error) reject(error);
    else resolve(value);
  };
  const onData = (chunk) => {
    for (const character of chunk) {
      if (character === "\u0003") {
        finish(new Error("Admin setup cancelled."));
        return;
      }
      if (character === "\r" || character === "\n") {
        finish();
        return;
      }
      if (character === "\u0008" || character === "\u007f") {
        if (value.length) {
          value = value.slice(0, -1);
          process.stdout.write("\b \b");
        }
        continue;
      }
      if (character >= " ") {
        value += character;
        process.stdout.write("*");
      }
    }
  };

  process.stdout.write(message);
  input.setRawMode(true);
  input.resume();
  input.setEncoding("utf8");
  input.on("data", onData);
});

const run = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be configured before Admin setup.");
  }

  const name = await promptLine("Initial Admin name: ");
  const email = (await promptLine("Initial Admin email: ")).toLowerCase();
  const password = await promptHidden("Password (minimum 12 characters): ");
  const confirmation = await promptHidden("Confirm password: ");
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid name and email are required.");
  }
  if (password.length < 12 || password.length > 128 || password !== confirmation) {
    throw new Error("Passwords must match and be between 12 and 128 characters.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  if (await User.exists({ role: "admin" })) {
    console.error("An Admin account already exists; initial setup is disabled.");
    process.exitCode = 1;
    return;
  }

  const passwordHash = await argon2.hash(password, PASSWORD_HASH_OPTIONS);
  await User.create({
    name,
    email,
    passwordHash,
    passwordSetAt: new Date(),
    role: "admin",
    isActive: true,
    isInitialAdmin: true,
  });
  console.log("Initial Admin account created. No password was displayed or logged.");
};

run()
  .catch(() => {
    console.error("Admin setup failed. Check the configuration and try again.");
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
