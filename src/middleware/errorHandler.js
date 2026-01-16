
import logger from "../utils/logger.js";
import { AppError } from "../utils/appError.js";


const errorHandler = (err, req, res, next) => {
  if (req.correlationId) {
    logger.setCorrelationId(req.correlationId);
  }

  logger.error(
    err.message || "Internal server error",
    {
      code: err.code,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
    }
  );

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  if (err.name === "ValidationError") {
    const details = {};
    for (const field in err.errors) {
      details[field] = err.errors[field].message;
    }

    return res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details,
      },
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: {
        code: "DUPLICATE_RESOURCE",
        message: `A resource with this ${field} already exists`,
        details: { field },
      },
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_ID",
        message: "Invalid resource ID",
        details: { field: err.path },
      },
    });
  }

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred",
      ...(process.env.NODE_ENV === "development" && {
        details: { stack: err.stack },
      }),
    },
  });
}

export default errorHandler;

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
