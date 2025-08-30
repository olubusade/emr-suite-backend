import pkg from 'pg';
import { config } from './config/config.js';
const { Pool } = pkg;
export const pool = new Pool(config.db);
export const q = (text, params) => pool.query(text, params);