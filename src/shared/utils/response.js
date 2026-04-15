import { STATUS } from '../../constants/index.js'; 
import { logger } from '../../config/logger.js';

/**
 * API RESPONSE UTILITIES
 * Standardizes the communication protocol between the server and clients.
 */

export function ok(res, data = null, message = 'OK', meta = undefined) {
    const body = { status: STATUS.SUCCESS, message, data };
    if (meta !== undefined) body.meta = meta;
    return res.status(200).json(body);
}

export function created(res, data = null, message = 'Created') {
    return res.status(201).json({ status: STATUS.SUCCESS, message, data });
}

/**
 * 200 DELETED 
 * Use deleted() when you want to return a confirmation message.
 * Use noContent() for a silent successful deletion.
 */
export function deleted(res, message = 'Resource deleted successfully') {
    return res.status(200).json({ 
        status: STATUS.SUCCESS, 
        message, 
        data: null 
    });
}
/**
 * 204 NO CONTENT
 * @param {*} res 
 * @returns 
 */
export function noContent(res) {
    return res.status(204).end();
}

/**
 * 401 UNAUTHORIZED
 */
export function unauthorized(res, message = 'Authentication required') {
    return res.status(401).json({ status: STATUS.FAIL, message });
}

/**
 * 403 FORBIDDEN
 */
export function forbidden(res, message = 'Access denied: Insufficient permissions') {
    return res.status(403).json({ status: STATUS.FAIL, message });
}

/**
 * 404 NOT FOUND
 */
export function notFound(res, message = 'Resource not found', details = null) {
    return res.status(404).json({ 
        status: STATUS.NOTFOUND || STATUS.FAIL, 
        message, 
        details 
    });
}
/**
 * Fail - 400
 * @param {*} res 
 * @param {*} statusCode 
 * @param {*} message 
 * @param {*} details 
 * @returns 
 */
export function fail(res, statusCode = 400, message = 'Bad Request', details = null) {
    logger.warn(`API Fail Response [${statusCode}]: ${message}`, { details });
    return res.status(statusCode).json({ status: STATUS.FAIL, message, details });
}

/**
 * 500 INTERNAL SERVER ERROR
 */
export function error(res, statusCode = 500, message = 'Internal Server Error', details = null) {
    logger.error(`API Error Response [${statusCode}]: ${message}`, { 
        details: details?.message || details 
    });
    return res.status(statusCode).json({ status: STATUS.ERROR, message, details });
}
/**
 * 409 CONFLICT
 * Used when a request conflicts with current server state
 * (e.g. duplicate email, duplicate patient, scheduling conflict)
 */
export function conflict(res,statusCode = 409, message = 'Conflict', details = null) {
    logger.warn(`API Conflict Response [409]: ${message}`, { details });

    return res.status(statusCode).json({
        status: STATUS.FAIL,
        message,
        details
    });
}
/**
 * SERVER ERROR 500+
 * @param {*} res 
 * @param {*} message 
 * @param {*} details 
 * @returns 
 */
export function serverError(res, message = 'Internal Server Error', details = null) {
    return res.status(500).json({
        status: STATUS.ERROR,
        message,
        details
    });
}