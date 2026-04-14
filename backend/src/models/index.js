// Central model exports + associations
// Controllers/routes import from this file, so it must re-export all models they use.

import Admin from "./admin.js";
import Category from "./Category.js";
import sequelize from "../db.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";
import Otp from "./Otp.js";
import Product from "./Product.js";
import Review from "./Review.js";
import Subcategory from "./Subcategories.js";
import User from "./User.js";
import StoreSetting from "./StoreSetting.js";

// ---- Associations ----

// Category ↔ Subcategory
Category.hasMany(Subcategory, { foreignKey: "category_id", as: "subcategories" });
// (Subcategory.belongsTo(Category)) is also defined inside Subcategories.js for backward compatibility.

// Category/Subcategory ↔ Product (optional normalized relations)
Category.hasMany(Product, { foreignKey: "category_id", as: "products" });
Subcategory.hasMany(Product, { foreignKey: "subcategory_id", as: "products" });
Product.belongsTo(Category, { foreignKey: "category_id", as: "categoryRef" });
Product.belongsTo(Subcategory, { foreignKey: "subcategory_id", as: "subcategoryRef" });

// User ↔ Order
User.hasMany(Order, {
  foreignKey: { name: "user_id", allowNull: true },
  as: "orders",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Order.belongsTo(User, {
  foreignKey: { name: "user_id", allowNull: true },
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Order ↔ OrderItem
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });

// Product ↔ OrderItem
Product.hasMany(OrderItem, { foreignKey: "product_id", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// Product/User ↔ Review
Product.hasMany(Review, { foreignKey: "product_id", as: "reviews" });
Review.belongsTo(Product, { foreignKey: "product_id", as: "product" });
User.hasMany(Review, { foreignKey: "user_id", as: "reviews" });
Review.belongsTo(User, { foreignKey: "user_id", as: "user" });

export {
  sequelize,
  Admin,
  Category,
  Order,
  OrderItem,
  Otp,
  Product,
  Review,
  Subcategory,
  User,
  StoreSetting,
};