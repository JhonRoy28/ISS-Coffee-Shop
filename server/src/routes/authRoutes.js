const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  completePasswordSetup,
  getCurrentUser,
  login,
  logout,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many sign-in attempts. Try again later." },
});
const setupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many password setup attempts. Try again later." },
});

router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", requireAuth, getCurrentUser);
router.post("/setup-password", setupLimiter, completePasswordSetup);

module.exports = router;
