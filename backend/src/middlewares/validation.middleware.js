import ValidationException from "../exceptions/validation.exception.js";

/**
 * Middleware factory to run Joi schema validation on req.body and throw ValidationException on failure.
 * @param {Joi.Schema} schema 
 * @returns {Function} Express middleware
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMap = error.details.reduce((acc, detail) => {
        const path = detail.path.join(".");
        acc[path] = detail.message;
        return acc;
      }, {});

      return next(new ValidationException("Validation failed", errorMap));
    }

    // Assign sanitized & validated properties back to body
    req.body = value;
    next();
  };
};

/**
 * Middleware factory to run Joi schema validation on req.query and throw ValidationException on failure.
 * @param {Joi.Schema} schema 
 * @returns {Function} Express middleware
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error) {
      const errorMap = error.details.reduce((acc, detail) => {
        const path = detail.path.join(".");
        acc[path] = detail.message;
        return acc;
      }, {});

      return next(new ValidationException("Validation failed", errorMap));
    }

    // Assign sanitized & validated properties back to query without re-assigning the query object itself
    for (const key in req.query) {
      delete req.query[key];
    }
    Object.assign(req.query, value);
    next();
  };
};

export default validate;
