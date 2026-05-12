/**
 * Standardized API response helpers
 */

const sendSuccess = (res, { message = 'Success', data = {}, statusCode = 200, meta = null } = {}) => {
  const response = { success: true, message, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

const sendCreated = (res, { message = 'Created successfully', data = {} } = {}) => {
  return sendSuccess(res, { message, data, statusCode: 201 });
};

const sendError = (res, { message = 'An error occurred', errorCode = 'SERVER_ERROR', statusCode = 500, errors = null } = {}) => {
  const response = { success: false, message, errorCode };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const sendPaginated = (res, { message = 'Success', data = [], page = 1, limit = 20, total = 0 } = {}) => {
  return sendSuccess(res, {
    message,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
};

module.exports = { sendSuccess, sendCreated, sendError, sendPaginated };
