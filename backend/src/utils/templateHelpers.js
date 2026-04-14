export const renderTemplate = (template = "", data = {}) => {
    const body = String(template || "");
    return body.replace(/\{\{\s*([^\s{}]+)\s*\}\}/g, (_match, key) => {
        const value = data[key];
        if (value === undefined || value === null) return "";
        return String(value);
    });
};

export const generateTrackingId = () => {
    return `TRK-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
};
