const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Enter a user name."],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, "Enter an email address."],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."],
    },
    passwordHash: {
      type: String,
      select: false,
    },
    passwordSetAt: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "staff"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isInitialAdmin: {
      type: Boolean,
      default: false,
      immutable: true,
      select: false,
    },
    passwordSetupTokenHash: {
      type: String,
      select: false,
    },
    passwordSetupExpiresAt: {
      type: Date,
      select: false,
    },
    sessionVersion: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.index(
  { isInitialAdmin: 1 },
  { unique: true, partialFilterExpression: { isInitialAdmin: true } }
);

userSchema.set("toJSON", {
  transform: (document, value) => {
    delete value.passwordHash;
    delete value.passwordSetupTokenHash;
    delete value.passwordSetupExpiresAt;
    delete value.sessionVersion;
    delete value.isInitialAdmin;
    delete value.__v;
    return value;
  },
});

module.exports = mongoose.model("User", userSchema);
