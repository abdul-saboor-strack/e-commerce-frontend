import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  Palette,
  User,
  Bell,
  Globe,
  Shield,
  Mail,
  CreditCard,
  ArrowLeft
} from "lucide-react";

type SettingsCategory = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
};

const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    id: "appearance",
    title: "Appearance & Themes",
    description: "Customize the color palette for your storefront and admin dashboard",
    icon: Palette,
    color: "var(--current-accent)"
  },
  {
    id: "general",
    title: "General Settings",
    description: "Store information, currency, and basic configuration",
    icon: SettingsIcon,
    color: "var(--current-accent)"
  },
  {
    id: "account",
    title: "Admin Account",
    description: "Manage your admin profile and security",
    icon: User,
    color: "var(--current-accent)"
  },
  {
    id: "content",
    title: "Content & SEO",
    description: "Page content, SEO settings, and policies",
    icon: Globe,
    color: "var(--current-accent)"
  },
  {
    id: "social",
    title: "Social Media",
    description: "Social media links and integrations",
    icon: Bell,
    color: "var(--current-accent)"
  },
  {
    id: "services",
    title: "Services & Policies",
    description: "Shipping, returns, payments, and service information",
    icon: Shield,
    color: "var(--current-accent)"
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Email templates and notification settings",
    icon: Mail,
    color: "var(--current-accent)"
  }
];

const AdminSettings = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/admin/settings/${categoryId}`);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: 32,
          margin: 0,
          fontWeight: 600,
          color: "var(--current-text)",
          marginBottom: 8
        }}>
          Store Settings
        </h1>
        <p style={{
          color: "var(--current-text-secondary)",
          fontSize: 16,
          margin: 0
        }}>
          Manage your store configuration and preferences
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 20
      }}>
        {SETTINGS_CATEGORIES.map((category) => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              style={{
                ...categoryCard,
                border: `1px solid var(--current-card-border)`,
                background: "var(--current-card-bg)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)";
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 16
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${category.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <IconComponent size={24} color={category.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--current-text)"
                  }}>
                    {category.title}
                  </h3>
                </div>
              </div>
              <p style={{
                margin: 0,
                color: "var(--current-text-secondary)",
                fontSize: 14,
                lineHeight: 1.5
              }}>
                {category.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const categoryCard: React.CSSProperties = {
  padding: 24,
  borderRadius: 16,
  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
  transition: "all 0.2s ease",
  border: "1px solid transparent"
};

export default AdminSettings;
