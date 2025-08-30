const { STATUS } = require('../constants');


function ok(res, data = null, message = 'OK', meta = undefined) {
    const body = { status: STATUS.SUCCESS, message, data };
    if (meta !== undefined) body.meta = meta;
    return res.status(200).json(body);
}

function created(res, data = null, message = 'Created') {
    return res.status(201).json({ status: STATUS.SUCCESS, message, data });
}

function fail(res, statusCode = 400, message = 'Bad Request', details = null) {
    return res.status(statusCode).json({ status: STATUS.FAIL, message, details });
}

function error(res, statusCode = 500, message = 'Internal Server Error', details = null) {
    return res.status(statusCode).json({ status: STATUS.ERROR, message, details });
}


module.exports = { ok, created, fail, error };