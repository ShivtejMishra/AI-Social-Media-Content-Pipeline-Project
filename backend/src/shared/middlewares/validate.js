const { sendError } = require('../utils/apiResponse');

/**
 * Zod schema validation middleware factory
 * @param {ZodSchema} schema - Zod schema to validate against
 * @param {string} source - 'body' | 'query' | 'params'
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return sendError(res, {
      message: 'Validation failed',
      errorCode: 'VALIDATION_ERROR',
      statusCode: 400,
      errors,
    });
  }

  req[source] = result.data;
  next();
};

module.exports = validate;
