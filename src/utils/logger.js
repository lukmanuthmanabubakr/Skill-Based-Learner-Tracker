
import { v4 as uuidv4 } from "uuid";

const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

class Logger {
  constructor() {
    this.correlationId = null;
  }

  setCorrelationId(id) {
    this.correlationId = id || uuidv4();
    return this.correlationId;
  }

  getCorrelationId() {
    return this.correlationId || uuidv4();
  }

  _formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const correlationId = this.getCorrelationId();

    return {
      timestamp,
      level,
      correlationId,
      message,
      ...data,
    };
  }

  error(message, data = {}) {
    const logEntry = this._formatMessage(LOG_LEVELS.ERROR, message, data);
    console.error(JSON.stringify(logEntry));
    return logEntry;
  }

  warn(message, data = {}) {
    const logEntry = this._formatMessage(LOG_LEVELS.WARN, message, data);
    console.warn(JSON.stringify(logEntry));
    return logEntry;
  }

  info(message, data = {}) {
    const logEntry = this._formatMessage(LOG_LEVELS.INFO, message, data);
    console.log(JSON.stringify(logEntry));
    return logEntry;
  }

  debug(message, data = {}) {
    if (process.env.LOG_LEVEL === "DEBUG") {
      const logEntry = this._formatMessage(LOG_LEVELS.DEBUG, message, data);
      console.debug(JSON.stringify(logEntry));
      return logEntry;
    }
  }
}

export default new Logger();
