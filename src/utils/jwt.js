import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/config.js';


export const signAccess = (payload) => jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.accessTtl });
export const signRefresh = (payload) => jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshTtl });
export const verifyAccess = (t) => jwt.verify(t, config.jwt.secret);
export const verifyRefresh = (t) => jwt.verify(t, config.jwt.refreshSecret);
export const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');