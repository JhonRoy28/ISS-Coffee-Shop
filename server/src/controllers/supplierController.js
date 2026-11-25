const mongoose = require("mongoose");
const Supplier = require("../models/Supplier");

const supplierFields = [
  "name",
  "contactPerson",
  "email",
  "phone",
  "category",
  "leadTime",
  "status",
  "notes",
];

const getSupplierFields = (body) => {
  const fields = {};
  for (const field of supplierFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      fields[field] = body[field];
    }
  }
  return fields;
};

const handleSupplierError = (error, res, next) => {
  if (error.code === 11000) {
    const fields = Object.keys(error.keyPattern || error.keyValue || {});
    const field = fields.length ? ` for ${fields.join(", ")}` : "";
    return res.status(409).json({
      message: `A supplier${field} already exists.`,
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      message: `Invalid supplier value for ${error.path}.`,
    });
  }

  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)
      .map((validationError) => validationError.message)
      .join(" ");
    return res.status(400).json({ message });
  }

  return next(error);
};

const isValidSupplierId = (id, res) => {
  if (mongoose.isValidObjectId(id)) return true;
  res.status(400).json({ message: "Invalid supplier ID." });
  return false;
};

const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json(suppliers);
  } catch (error) {
    next(error);
  }
};

const createSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(getSupplierFields(req.body || {}));
    res.status(201).json(supplier);
  } catch (error) {
    handleSupplierError(error, res, next);
  }
};

const updateSupplier = async (req, res, next) => {
  if (!isValidSupplierId(req.params.id, res)) return;

  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      getSupplierFields(req.body || {}),
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found." });
    }

    res.status(200).json(supplier);
  } catch (error) {
    handleSupplierError(error, res, next);
  }
};

const deleteSupplier = async (req, res, next) => {
  if (!isValidSupplierId(req.params.id, res)) return;

  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found." });
    }

    res.status(200).json({
      message: "Supplier deleted successfully.",
      supplier,
    });
  } catch (error) {
    handleSupplierError(error, res, next);
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
