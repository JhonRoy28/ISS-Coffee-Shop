const express = require("express");
const {
  createSetupInvite,
  createStaff,
  listStaff,
  setStaffActiveStatus,
  updateStaff,
} = require("../controllers/userController");
const {
  requireAuth,
  requireRole,
} = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));
router.get("/", listStaff);
router.post("/", createStaff);
router.post("/:id/setup-invite", createSetupInvite);
router.patch("/:id", updateStaff);
router.patch("/:id/status", setStaffActiveStatus);

module.exports = router;
