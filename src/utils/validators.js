
import { ValidationError } from "./appError.js";


export const userProfileValidationRules = {
  name: {
    required: false,
    minLength: 2,
    maxLength: 100,
    trim: true,
  },
  bio: {
    required: false,
    maxLength: 500,
    trim: true,
  },
  avatar_url: {
    required: false,
    maxLength: 500,
    trim: true,
  },
};

export const skillValidationRules = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 50,
    trim: true,
  },
  description: {
    required: false,
    maxLength: 500,
    trim: true,
  },
  category: {
    required: true,
    trim: true,
  },
};


export const practiceLogValidationRules = {
  skillId: {
    required: true,
    type: "string",
  },
  duration: {
    required: true,
    type: "number",
    min: 1,
    max: 1440, // 24 hours
  },
  notes: {
    required: false,
    maxLength: 1000,
    trim: true,
  },
  focusArea: {
    required: false,
    maxLength: 200,
    trim: true,
  },
};


export const evidenceValidationRules = {
  skillId: {
    required: true,
    type: "string",
  },
  title: {
    required: true,
    minLength: 5,
    maxLength: 200,
    trim: true,
  },
  description: {
    required: false,
    maxLength: 2000,
    trim: true,
  },
  type: {
    required: true,
    enum: ["project", "certification", "presentation", "publication", "other"],
  },
};

/**
 * Validate a field against a rule
 * @param {*} value - Field value
 * @param {string} fieldName - Field name
 * @param {Object} rule - Validation rule
 * @throws {ValidationError}
 */
export function validateField(value, fieldName, rule) {
  // Check required
  if (rule.required && (value === undefined || value === null || value === "")) {
    throw new ValidationError(`${fieldName} is required`, { field: fieldName });
  }

  if (value === undefined || value === null) {
    return; // Skip other checks if not required and empty
  }

  // Trim if applicable
  let processedValue = value;
  if (rule.trim && typeof value === "string") {
    processedValue = value.trim();
  }

  // Check type
  if (rule.type && typeof processedValue !== rule.type) {
    throw new ValidationError(
      `${fieldName} must be of type ${rule.type}`,
      { field: fieldName, expected: rule.type }
    );
  }

  // Check string length
  if (typeof processedValue === "string") {
    if (rule.minLength && processedValue.length < rule.minLength) {
      throw new ValidationError(
        `${fieldName} must be at least ${rule.minLength} characters`,
        { field: fieldName, min: rule.minLength }
      );
    }
    if (rule.maxLength && processedValue.length > rule.maxLength) {
      throw new ValidationError(
        `${fieldName} must not exceed ${rule.maxLength} characters`,
        { field: fieldName, max: rule.maxLength }
      );
    }
  }

  // Check numeric range
  if (typeof processedValue === "number") {
    if (rule.min !== undefined && processedValue < rule.min) {
      throw new ValidationError(
        `${fieldName} must be at least ${rule.min}`,
        { field: fieldName, min: rule.min }
      );
    }
    if (rule.max !== undefined && processedValue > rule.max) {
      throw new ValidationError(
        `${fieldName} must not exceed ${rule.max}`,
        { field: fieldName, max: rule.max }
      );
    }
  }

  // Check enum
  if (rule.enum && !rule.enum.includes(processedValue)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${rule.enum.join(", ")}`,
      { field: fieldName, allowed: rule.enum }
    );
  }
}

/**
 * Validate an object against a schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Validated and sanitized data
 * @throws {ValidationError}
 */
export function validateObject(data, schema) {
  const validated = {};

  for (const [key, rule] of Object.entries(schema)) {
    const value = data[key];
    validateField(value, key, rule);

    // Apply trimming for strings
    if (rule.trim && typeof data[key] === "string") {
      validated[key] = data[key].trim();
    } else {
      validated[key] = data[key];
    }
  }

  return validated;
}

/**
 * Validate pagination parameters
 * @param {Object} query - Query parameters
 * @returns {Object} Validated pagination params
 * @throws {ValidationError}
 */
export function validatePaginationParams(query) {
  const limit = parseInt(query.limit) || 20;
  const cursor = query.cursor || null;

  if (limit < 1 || limit > 100) {
    throw new ValidationError("Limit must be between 1 and 100", {
      field: "limit",
      min: 1,
      max: 100,
    });
  }

  return { limit, cursor };
}

/**
 * Validate sort parameter
 * @param {string} sortParam - Sort parameter (e.g., "field:asc")
 * @param {Array<string>} allowedFields - Allowed sort fields
 * @returns {Object} Parsed sort object
 * @throws {ValidationError}
 */
export function validateSort(sortParam, allowedFields) {
  if (!sortParam) {
    return { field: "createdAt", direction: "desc" };
  }

  const [field, direction] = sortParam.split(":");

  if (!allowedFields.includes(field)) {
    throw new ValidationError("Invalid sort field", {
      field: "sort",
      allowed: allowedFields,
    });
  }

  if (!["asc", "desc"].includes(direction)) {
    throw new ValidationError("Sort direction must be 'asc' or 'desc'", {
      field: "sort",
    });
  }

  return { field, direction };
}

/**
 * Validate filter
 * @param {string} filterValue - Filter value
 * @param {Array<string>} allowedValues - Allowed values
 * @param {string} filterName - Filter name
 * @throws {ValidationError}
 */
export function validateFilter(filterValue, allowedValues, filterName) {
  if (!allowedValues.includes(filterValue)) {
    throw new ValidationError(`Invalid ${filterName}`, {
      field: filterName,
      allowed: allowedValues,
    });
  }
}
