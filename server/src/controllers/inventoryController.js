const InventoryItem = require("../models/InventoryItem");

// GET: Retrieve all inventory items
const getItems = async (req, res, next) => {
  try {
    const items = await InventoryItem.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

// POST: Add a new inventory item
const createItem = async (req, res, next) => {
  try {
    const newItem = await InventoryItem.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

// PUT: Update an inventory item
const updateItem = async (req, res, next) => {
  try {
    const updatedItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Inventory item not found." });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    next(error);
  }
};

// DELETE: Remove an inventory item
const deleteItem = async (req, res, next) => {
  try {
    const deletedItem = await InventoryItem.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Inventory item not found." });
    }

    res.status(200).json({ message: "Inventory item deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  createItem,
  updateItem,
  deleteItem,
};
