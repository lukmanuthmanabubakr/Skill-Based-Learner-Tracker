import { v4 as uuidv4 } from "uuid";
import logger from "../utils/logger.js";

const correlationIdMiddleware = (req, res, next) => {
  const correlationId = req.headers["x-correlation-id"] || uuidv4();

  req.correlationId = correlationId;
  res.setHeader("X-Correlation-ID", correlationId);

  logger.setCorrelationId(correlationId);

  logger.info(`${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    userId: req.user?.id,
  });

  next();
};

export default correlationIdMiddleware;
