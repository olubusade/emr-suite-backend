const ApiError = require('../utils/ApiError');
const { error } = require('../utils/response');


module.exports = (err, req, res, _next) => {
    const isKnown = err instanceof ApiError;
    const statusCode = isKnown ? err.statusCode : 500;
    const payload = isKnown ? err.details : { stack: process.env.NODE_ENV === 'development' ? err.stack : undefined };
    return error(res, statusCode, err.message || 'Unexpected error', payload);
};