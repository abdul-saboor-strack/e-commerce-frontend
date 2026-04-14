// Simple in-memory rate limiter for admin login (use Redis in production)
const loginAttempts = new Map();

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

export const adminLoginRateLimiter = (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    const email = req.body?.email?.toLowerCase();
    const key = `${clientIp}:${email}`;

    const now = Date.now();
    const attempts = loginAttempts.get(key);

    if (attempts) {
        // Check if lockout period has expired
        if (now - attempts.firstAttempt > LOCKOUT_TIME) {
            loginAttempts.delete(key);
        } else if (attempts.count >= MAX_ATTEMPTS) {
            const remainingTime = Math.ceil((LOCKOUT_TIME - (now - attempts.firstAttempt)) / 1000);
            return res.status(429).json({
                message: `Too many login attempts. Please try again in ${remainingTime} seconds.`,
                retryAfter: remainingTime
            });
        }
    }

    next();
};

export const recordLoginAttempt = (email, success, clientIp) => {
    const key = `${clientIp}:${email.toLowerCase()}`;
    const now = Date.now();

    if (success) {
        // Clear attempts on successful login
        loginAttempts.delete(key);
    } else {
        // Record failed attempt
        const attempts = loginAttempts.get(key);
        if (attempts) {
            attempts.count += 1;
        } else {
            loginAttempts.set(key, { count: 1, firstAttempt: now });
        }
    }
};

export const clearLoginAttempts = (email, clientIp) => {
    const key = `${clientIp}:${email.toLowerCase()}`;
    loginAttempts.delete(key);
};
