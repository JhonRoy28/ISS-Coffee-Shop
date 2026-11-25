const express = require("express");
const router = express.Router();

const {
  getItems,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/inventoryController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);

router.get("/", getItems);
router.post("/", createItem);
router.put("/:id", updateItem);
router.delete("/:id", requireRole("admin"), deleteItem);

module.exports = router;
