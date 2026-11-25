const mongoose = require("mongoose");
const User = require("../models/User");
const {
  createSetupToken,
  createSetupUrl,
  toPublicUser,
} = require("../utils/userSecurity");

const normalizeAccountFields = (body) => ({
  name: typeof body.name === "string" ? body.name.trim() : "",
  email: typeof body.email === "string" ? body.email.trim().toLowerCase() : "",
});

const handleUserError = (error, res, next) => {
  if (error.code === 11000) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }
  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)
      .map((validationError) => validationError.message)
      .join(" ");
    return res.status(400).json({ message });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid user account ID." });
  }
  return next(error);
};

const isValidUserId = (id, res) => {
  if (mongoose.isValidObjectId(id)) return true;
  res.status(400).json({ message: "Invalid user account ID." });
  return false;
};

const createStaff = async (req, res, next) => {
  const fields = normalizeAccountFields(req.body || {});
  if (!fields.name || !fields.email) {
    return res.status(400).json({ message: "Name and email are required." });
  }

  try {
    const setup = createSetupToken();
    const user = await User.create({
      ...fields,
      role: "staff",
      isActive: true,
      isInitialAdmin: false,
      passwordSetupTokenHash: setup.tokenHash,
      passwordSetupExpiresAt: setup.expiresAt,
    });

    return res.status(201).json({
      user: toPublicUser(user),
      setupUrl: createSetupUrl(setup.token),
    });
  } catch (error) {
    return handleUserError(error, res, next);
  }
};

const listStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ role: "staff" })
      .select("name email role isActive createdAt passwordSetAt")
      .sort({ createdAt: -1 });
    return res.status(200).json(staff.map(toPublicUser));
  } catch (error) {
    return next(error);
  }
};

const updateStaff = async (req, res, next) => {
  if (!isValidUserId(req.params.id, res)) return;

  const fields = {};
  if (Object.prototype.hasOwnProperty.call(req.body || {}, "name")) {
    fields.name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  }
  if (Object.prototype.hasOwnProperty.call(req.body || {}, "email")) {
    fields.email = typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  }
  if (!Object.keys(fields).length) {
    return res.status(400).json({ message: "Provide a name or email to update." });
  }

  try {
    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, role: "staff" },
      { $set: fields },
      { returnDocument: "after", runValidators: true }
    ).select("name email role isActive createdAt passwordSetAt");

    if (!staff) {
      return res.status(404).json({ message: "Staff account not found." });
    }
    return res.status(200).json({ user: toPublicUser(staff) });
  } catch (error) {
    return handleUserError(error, res, next);
  }
};

const setStaffActiveStatus = async (req, res, next) => {
  if (!isValidUserId(req.params.id, res)) return;
  if (typeof req.body?.isActive !== "boolean") {
    return res.status(400).json({ message: "isActive must be true or false." });
  }

  try {
    const staff = await User.findOne({ _id: req.params.id, role: "staff" })
      .select("+sessionVersion");
    if (!staff) {
      return res.status(404).json({ message: "Staff account not found." });
    }

    staff.isActive = req.body.isActive;
    staff.sessionVersion += 1;
    await staff.save();
    return res.status(200).json({ user: toPublicUser(staff) });
  } catch (error) {
    return handleUserError(error, res, next);
  }
};

const createSetupInvite = async (req, res, next) => {
  if (!isValidUserId(req.params.id, res)) return;

  try {
    const user = await User.findById(req.params.id)
      .select("+passwordHash +passwordSetupTokenHash +passwordSetupExpiresAt");
    if (!user || !user.isActive || user.role !== "staff") {
      return res.status(404).json({ message: "Active Staff account not found." });
    }
    if (user.passwordHash) {
      return res.status(409).json({ message: "This account already has a password set." });
    }

    const setup = createSetupToken();
    user.passwordSetupTokenHash = setup.tokenHash;
    user.passwordSetupExpiresAt = setup.expiresAt;
    await user.save();

    return res.status(200).json({
      user: toPublicUser(user),
      setupUrl: createSetupUrl(setup.token),
    });
  } catch (error) {
    return handleUserError(error, res, next);
  }
};

module.exports = {
  createSetupInvite,
  createStaff,
  listStaff,
  setStaffActiveStatus,
  updateStaff,
};
