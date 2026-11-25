const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Duplicate SKU
  if (err.code === 11000) {
    return res.status(409).json({
      message: "An inventory item with this SKU already exists.",
    });
  }

  // Invalid MongoDB ID
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid inventory item ID.",
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: err.message,
    });
  }

  res.status(500).json({
    message: "Internal server error.",
  });
};

module.exports = errorHandler;
