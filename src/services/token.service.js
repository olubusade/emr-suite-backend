const jwtUtil = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

function generateAuthTokens(payload) {
    const accessToken = jwtUtil.signAccess(payload);
    const refreshToken = jwtUtil.signRefresh(payload);
    return { accessToken, refreshToken };
}


function verifyAccess(token) {
    try { return jwtUtil.verifyAccess(token); }
    catch (e) { throw new ApiError(401, 'Invalid or expired access token'); }
}


function verifyRefresh(token) {
    try { return jwtUtil.verifyRefresh(token); }
    catch (e) { throw new ApiError(401, 'Invalid or expired refresh token'); }
}


module.exports = { generateAuthTokens, verifyAccess, verifyRefresh };