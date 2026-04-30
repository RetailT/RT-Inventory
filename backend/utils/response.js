/**
 * Send a success response
 * @param {object} res        - Express response object
 * @param {object} data       - Payload to send
 * @param {string} message    - Optional success message
 * @param {number} statusCode - HTTP status (default 200)
 */
const sendSuccess = (res, data = {}, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

/**
 * Send an error response
 * @param {object} res        - Express response object
 * @param {string} message    - Error message
 * @param {number} statusCode - HTTP status (default 500)
 */
const sendError = (res, message = "Something went wrong.", statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { sendSuccess, sendError };