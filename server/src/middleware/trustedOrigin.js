const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const trustedOrigin = (allowedOrigin) => (req, res, next) => {
  if (SAFE_METHODS.has(req.method) || req.get("origin") === allowedOrigin) {
    return next();
  }
  return res.status(403).json({ message: "Request origin is not allowed." });
};

module.exports = trustedOrigin;
