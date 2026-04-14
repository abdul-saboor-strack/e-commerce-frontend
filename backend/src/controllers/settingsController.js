import StoreSetting from "../models/StoreSetting.js";

// Default settings if DB empty
export const DEFAULTS = {
  store_name: "FS 5 Collection",
  currency: "PKR",
  hero_title: "FS 5 Collection",
  hero_subtitle: "Clean premium storefront designed to feel polished on mobile, tablet, and desktop.",
  support_text: "Support 24/7",
  announcement_text: "Free delivery in selected areas • Easy returns • Secure checkout",
  footer_tagline: "Premium essentials and modern fashion drops.",
  delivery_text: "Dispatch in 24-48 hours where available.",
  returns_text: "Simple return support within policy window.",
  payments_text: "Protected checkout experience with trusted methods.",
  // Home page theme (Dark theme)
  home_theme_primary: "#427f10",
  home_theme_accent: "#6366f1",
  home_theme_bg: "#020617",
  home_theme_surface: "#0f172a",
  home_theme_text: "#ffffff",
  home_theme_text_secondary: "#254b80ff",
  home_theme_input_bg: "#232939",
  home_theme_input_border: "hsla(215, 29%, 41%, 1.00)",
  home_theme_input_text: "#ffffff",
  home_theme_button_primary: "#0f3334",
  home_theme_button_secondary: "#0f223e",
  home_theme_card_bg: "#11414b",
  home_theme_card_border: "#1c2e4a",
  home_theme_header: "#020617",
  home_theme_outer_bg: "#020617",
  home_theme_success: "#22c55e",
  home_theme_error: "#ef4444",
  // Admin page theme (Dark theme like home)
  admin_theme_primary: "#427f10",
  admin_theme_accent: "#6366f1",
  admin_theme_bg: "#020617",
  admin_theme_surface: "#0f172a",
  admin_theme_text: "#ffffff",
  admin_theme_text_secondary: "#94a3b8",
  admin_theme_input_bg: "#232939",
  admin_theme_input_border: "#4a6387",
  admin_theme_input_text: "#ffffff",
  admin_theme_button_primary: "#0f3334",
  admin_theme_button_secondary: "#0f223e",
  admin_theme_card_bg: "#11414b",
  admin_theme_card_border: "#1c2e4a",
  admin_theme_header: "#020617",
  admin_theme_outer_bg: "#020617",
  admin_theme_success: "#22c55e",
  admin_theme_error: "#ef4444",
  // Legacy (for backwards compatibility)
  theme_primary: "#111827",
  theme_accent: "#6366f1",
  theme_bg: "#020617",
  theme_surface: "#0f172a",
  theme_text: "#ffffff",
  // Contact & Social
  contact_email: "support@fs5collection.com",
  contact_phone: "+92-300-1234567",
  social_links: [
    { platform: "Facebook", url: "https://facebook.com/fs5collection" },
    { platform: "Instagram", url: "https://instagram.com/fs5collection" },
  ],
  // Email Settings
  feedback_email_subject: "New Feedback from Customer",
  // SEO & Content
  seo_title: "FS 5 Collection - Premium Fashion & Essentials",
  seo_description: "Discover premium fashion and modern essentials at FS 5 Collection. Quality products with fast delivery.",
  about_text: "FS 5 Collection offers premium fashion and lifestyle products with a focus on quality and style.",
  shipping_policy: "We offer free shipping on orders over Rs. 5000. Standard delivery takes 3-5 business days.",
  privacy_policy: "We respect your privacy and are committed to protecting your personal data.",
  terms_conditions: "By using our service, you agree to our terms and conditions.",
};

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

// Convert old social media fields to new social_links format
const convertOldSocialFields = (settings) => {
  const oldFields = {
    social_facebook: "Facebook",
    social_instagram: "Instagram",
    social_twitter: "Twitter",
    social_linkedin: "LinkedIn",
    social_youtube: "YouTube",
    social_tiktok: "TikTok",
    social_pinterest: "Pinterest",
  };

  // If we have old fields and no social_links, convert them
  const hasOldFields = Object.keys(oldFields).some(field => settings[field]);

  if (hasOldFields && !settings.social_links) {
    const socialLinks = [];
    Object.entries(oldFields).forEach(([field, platform]) => {
      if (settings[field]) {
        socialLinks.push({ platform, url: settings[field] });
      }
    });
    settings.social_links = socialLinks;
  }

  // Remove old fields
  Object.keys(oldFields).forEach(field => {
    delete settings[field];
  });

  return settings;
};

export const getPublicSettings = async (req, res) => {
  try {
    const rows = await StoreSetting.findAll();
    const map = { ...DEFAULTS };
    rows.forEach((r) => {
      map[r.key] = parseSettingValue(r.key, r.value);
    });
    // Convert old format to new format
    const converted = convertOldSocialFields(map);
    res.json(converted);
  } catch (err) {
    console.error("getPublicSettings error:", err);
    res.json(DEFAULTS);
  }
};

export const upsertSettings = async (req, res) => {
  try {
    const updates = req.body || {};
    const keys = Object.keys(updates);

    // Save all settings to database
    for (const key of keys) {
      let value = updates[key];
      if (value !== null && typeof value === "object") {
        value = JSON.stringify(value);
      }
      await StoreSetting.upsert({
        key,
        value: value == null ? null : String(value),
      });
    }

    // Clean up old social fields from database if updating social_links
    if (updates.social_links) {
      const oldSocialFields = [
        "social_facebook",
        "social_instagram",
        "social_twitter",
        "social_linkedin",
        "social_youtube",
        "social_tiktok",
        "social_pinterest",
      ];
      for (const field of oldSocialFields) {
        await StoreSetting.destroy({ where: { key: field } });
      }
    }

    // Return complete settings merged with defaults
    const rows = await StoreSetting.findAll();
    const map = { ...DEFAULTS };
    rows.forEach((r) => {
      map[r.key] = parseSettingValue(r.key, r.value);
    });
    const converted = convertOldSocialFields(map);

    res.json({ ok: true, settings: converted });
  } catch (err) {
    console.error("upsertSettings error:", err);
    res.status(500).json({ ok: false, message: "Failed to save settings", error: err.message });
  }
};
