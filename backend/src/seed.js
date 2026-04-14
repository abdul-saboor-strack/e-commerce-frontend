import { Category, Product, Subcategory, Admin, sequelize } from "./models/index.js";
import bcrypt from "bcryptjs";

const products = [
    {
        name: "Men T-Shirt",
        description: "Comfortable cotton t-shirt",
        price: 25,
        image: "https://example.com/tshirt.jpg",
        category: "Men",
        subcategory: "T-Shirts",
        stock: 50
    },
    {
        name: "Women Dress",
        description: "Elegant summer dress",
        price: 40,
        image: "https://example.com/dress.jpg",
        category: "Women",
        subcategory: "Dresses",
        stock: 30
    },
    {
        name: "Kids Hoodie",
        description: "Warm kids hoodie",
        price: 35,
        image: "https://example.com/kidshoodie.jpg",
        category: "Kids",
        subcategory: "Winter Wear",
        stock: 20
    }
];

const seedProducts = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });

        // categories
        const men = await Category.findOrCreate({ where: { name: "Men" }, defaults: { name: "Men" } });
        const women = await Category.findOrCreate({ where: { name: "Women" }, defaults: { name: "Women" } });
        const kids = await Category.findOrCreate({ where: { name: "Kids" }, defaults: { name: "Kids" } });

        await Subcategory.findOrCreate({ where: { name: "T-Shirts", category_id: men[0].id }, defaults: { name: "T-Shirts", category_id: men[0].id } });
        await Subcategory.findOrCreate({ where: { name: "Dresses", category_id: women[0].id }, defaults: { name: "Dresses", category_id: women[0].id } });
        await Subcategory.findOrCreate({ where: { name: "Winter Wear", category_id: kids[0].id }, defaults: { name: "Winter Wear", category_id: kids[0].id } });

        await Product.bulkCreate(products, { ignoreDuplicates: true });

        // Seed admin user
        const adminEmail = "admin@store.com";
        const adminPassword = "admin123";
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await Admin.findOrCreate({
            where: { email: adminEmail },
            defaults: {
                name: "Admin",
                email: adminEmail,
                password: hashedPassword
            }
        });

        console.log("✅ Products and admin seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding products:", err);
        process.exit(1);
    }
};

seedProducts();