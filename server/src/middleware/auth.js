const User = require("../models/User");

const destroySession = (req, next) => {
  if (!req.session) return next();
  req.session.destroy((error) => next(error));
};

const requireAuth = async (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const user = await User.findById(req.session.userId)
      .select("+sessionVersion");
    if (
      !user
      || !user.isActive
      || user.sessionVersion !== req.session.sessionVersion
    ) {
      return destroySession(req, (error) => {
        if (error) return next(error);
        res.status(401).json({ message: "Authentication required." });
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission to perform this action." });
  }
  return next();
};

module.exports = {
  requireAuth,
  requireRole,
};
