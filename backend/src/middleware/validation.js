// Input validation utilities
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(email).toLowerCase()) && email.length <= 255;
};

export const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    return {
        isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumber,
        requirements: {
            minLength: hasMinLength,
            uppercase: hasUpperCase,
            lowercase: hasLowerCase,
            number: hasNumber
        }
    };
};

export const validateLoginInput = (req, res, next) => {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    // Validate email format
    if (!validateEmail(email)) {
        return res.status(400).json({
            message: "Invalid email format"
        });
    }

    // Check password length (don't validate complexity for login, just presence)
    if (typeof password !== 'string' || password.length < 1) {
        return res.status(400).json({
            message: "Invalid password"
        });
    }

    // Sanitize input
    req.body.email = String(email).toLowerCase().trim();
    req.body.password = String(password);

    next();
};

export const validateAdminRegistration = (req, res, next) => {
    const { email, password, name } = req.body;

    // Check required fields
    if (!email || !password || !name) {
        return res.status(400).json({
            message: "Email, password, and name are required"
        });
    }

    // Validate email
    if (!validateEmail(email)) {
        return res.status(400).json({
            message: "Invalid email format"
        });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return res.status(400).json({
            message: "Password must be at least 8 characters with uppercase, lowercase, and numbers",
            requirements: passwordValidation.requirements
        });
    }

    // Validate name
    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 255) {
        return res.status(400).json({
            message: "Name must be between 2 and 255 characters"
        });
    }

    // Sanitize input
    req.body.email = String(email).toLowerCase().trim();
    req.body.name = String(name).trim();
    req.body.password = String(password);

    next();
};
