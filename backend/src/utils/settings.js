import StoreSetting from "../models/StoreSetting.js";
import { DEFAULTS } from "../controllers/settingsController.js";

const parseSettingValue = (key, value) => {
    if (key === "social_links") {
        try {
            return value ? JSON.parse(value) : DEFAULTS.social_links;
        } catch {
            return DEFAULTS.social_links;
        }
    }
    return value;
};

export const loadSettings = async () => {
    const rows = await StoreSetting.findAll();
    const map = { ...DEFAULTS };
    rows.forEach((row) => {
        map[row.key] = parseSettingValue(row.key, row.value);
    });
    return map;
};
