const express = require("express");
const router = express.Router();

const {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);
router.get("/", getSuppliers);
router.post("/", requireRole("admin"), createSupplier);
router.put("/:id", requireRole("admin"), updateSupplier);
router.delete("/:id", requireRole("admin"), deleteSupplier);

module.exports = router;
