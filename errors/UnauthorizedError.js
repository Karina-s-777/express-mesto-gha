const { HTTP_STATUS_UNAUTHORIZED } = require('http2').constants;

module.exports = class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = HTTP_STATUS_UNAUTHORIZED;
  }
};
