import dotenv from 'dotenv';
dotenv.config();
export const config = {
    port: Number(process.env.PORT || 5000),
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    jwt: {
        secret: process.env.JWT_SECRET,
        refreshSecret: process.env.REFRESH_SECRET,
        accessTtl: process.env.ACCESS_TTL || '15m',
        refreshTtl: process.env.REFRESH_TTL || '7d'
    },
    db: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    }
};