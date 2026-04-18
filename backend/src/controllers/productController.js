import { Category, Product, Subcategory } from "../models/index.js";

function withImageUrl(req, product) {
    const p = product.toJSON ? product.toJSON() : product;
    if (p.image && !String(p.image).startsWith("http")) {
        p.image = `${req.protocol}://${req.get("host")}/uploads/${p.image}`;
    } else {
        p.image = p.image || null;
    }
    p.imageUrl = p.image;
    // Handle multiple images - return full URLs in the images field
    if (p.images && Array.isArray(p.images)) {
        p.images = p.images.map(img => {
            if (img && !String(img).startsWith("http")) {
                return `${req.protocol}://${req.get("host")}/uploads/${img}`;
            }
            return img;
        });
    } else {
        p.images = [];
    }
    return p;
}

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            order: [["id", "DESC"]],
            include: [
                { model: Category, as: "categoryRef", attributes: ["id", "name"], required: false },
                { model: Subcategory, as: "subcategoryRef", attributes: ["id", "name"], required: false },
            ],
        });

        res.json(products.map((p) => withImageUrl(req, p)));
    } catch (err) {
        res.status(500).json({ message: "Error fetching products", error: err });
    }
};

// Get single product by id
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(withImageUrl(req, product));
    } catch (err) {
        res.status(500).json({ message: "Error fetching product", error: err });
    }
};

// Create new product
export const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            stock,
            status,
            category,
            subcategory,
            category_id,
            subcategory_id,
        } = req.body;

        // Keep form forgiving: Admin panel can send minimal fields.
        if (!name || price === undefined) {
            return res.status(400).json({ message: "Name and price are required" });
        }

        // Normalize / auto-create category & subcategory when needed
        let resolvedCategoryId = category_id ? Number(category_id) : null;
        let resolvedCategoryName = category ? String(category).trim() : "";
        let resolvedSubcategoryId = subcategory_id ? Number(subcategory_id) : null;
        let resolvedSubcategoryName = subcategory ? String(subcategory).trim() : "";

        if (!resolvedCategoryId && resolvedCategoryName) {
            const [catRow] = await Category.findOrCreate({
                where: { name: resolvedCategoryName },
                defaults: { name: resolvedCategoryName },
            });
            resolvedCategoryId = catRow.id;
        }

        if (resolvedCategoryId && !resolvedCategoryName) {
            const catRow = await Category.findByPk(resolvedCategoryId);
            resolvedCategoryName = catRow?.name || "";
        }

        // If category missing entirely, keep it blank (product still saves).

        if (!resolvedSubcategoryId && resolvedSubcategoryName && resolvedCategoryId) {
            const [subRow] = await Subcategory.findOrCreate({
                where: { category_id: resolvedCategoryId, name: resolvedSubcategoryName },
                defaults: { category_id: resolvedCategoryId, name: resolvedSubcategoryName },
            });
            resolvedSubcategoryId = subRow.id;
        }

        if (resolvedSubcategoryId && !resolvedSubcategoryName) {
            const subRow = await Subcategory.findByPk(resolvedSubcategoryId);
            resolvedSubcategoryName = subRow?.name || "";
        }

        const product = await Product.create({
            name,
            description: description ?? "",
            price: Number(price),
            stock: Number(stock || 0),
            status: status || (Number(stock || 0) > 0 ? "active" : "out_of_stock"),
            category: resolvedCategoryName || null,
            subcategory: resolvedSubcategoryName || null,
            category_id: resolvedCategoryId,
            subcategory_id: resolvedSubcategoryId,
            image: req.files?.length > 0 ? req.files[0].filename : null, // First image for backwards compatibility
            images: req.files?.map(file => file.filename) || null, // Array of all images
        });

        res.json(withImageUrl(req, product));
    } catch (err) {
        res.status(500).json({ message: "Error creating product", error: err.message });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, subcategory, stock, status, category_id, subcategory_id } = req.body;
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        let resolvedCategoryId = category_id !== undefined ? (category_id ? Number(category_id) : null) : product.category_id;
        let resolvedCategoryName = category !== undefined ? String(category || "").trim() : (product.category || "");
        let resolvedSubcategoryId = subcategory_id !== undefined ? (subcategory_id ? Number(subcategory_id) : null) : product.subcategory_id;
        let resolvedSubcategoryName = subcategory !== undefined ? String(subcategory || "").trim() : (product.subcategory || "");

        if (!resolvedCategoryId && resolvedCategoryName) {
            const [catRow] = await Category.findOrCreate({
                where: { name: resolvedCategoryName },
                defaults: { name: resolvedCategoryName },
            });
            resolvedCategoryId = catRow.id;
        }
        if (resolvedCategoryId && !resolvedCategoryName) {
            const catRow = await Category.findByPk(resolvedCategoryId);
            resolvedCategoryName = catRow?.name || "";
        }

        if (!resolvedSubcategoryId && resolvedSubcategoryName && resolvedCategoryId) {
            const [subRow] = await Subcategory.findOrCreate({
                where: { category_id: resolvedCategoryId, name: resolvedSubcategoryName },
                defaults: { category_id: resolvedCategoryId, name: resolvedSubcategoryName },
            });
            resolvedSubcategoryId = subRow.id;
        }
        if (resolvedSubcategoryId && !resolvedSubcategoryName) {
            const subRow = await Subcategory.findByPk(resolvedSubcategoryId);
            resolvedSubcategoryName = subRow?.name || "";
        }

        const next = {
            name: name ?? product.name,
            description: description ?? product.description,
            price: price !== undefined ? Number(price) : product.price,
            category: resolvedCategoryName || null,
            subcategory: resolvedSubcategoryName || null,
            stock: stock !== undefined ? Number(stock) : product.stock,
            status: status ?? product.status,
            category_id: resolvedCategoryId,
            subcategory_id: resolvedSubcategoryId,
        };

        if (req.files?.length > 0) {
            next.image = req.files[0].filename; // First image for backwards compatibility
            next.images = req.files.map(file => file.filename); // Array of all images
        }
        if (next.stock <= 0 && next.status === "active") next.status = "out_of_stock";

        await product.update(next);
        res.json(withImageUrl(req, product));
    } catch (err) {
        res.status(500).json({ message: "Error updating product", error: err.message });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        await product.destroy();
        res.json({ message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting product", error: err.message });
    }
};
