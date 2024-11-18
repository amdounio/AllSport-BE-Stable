// controllers/CategoryController.js
const { Category } = require("../config/relation");

module.exports = {
    createCategory: async (req, res) => {
        try {
            const category = await Category.create(req.body);
            res.status(201).json({ ok: true, entity: category });
        } catch (error) {
            console.log(error);
            res.status(500).json({ ok: false, error: "Error creating category!" });
        }
    },

    updateCategory: async (req, res) => {
        try {
            const [updated] = await Category.update(req.body, {
                where: { id: req.params.id }
            });
            if (updated) {
                res.status(200).json({ ok: true, message: "Category updated successfully!" });
            } else {
                res.status(404).json({ ok: false, error: "Category not found!" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ ok: false, error: "Error updating category!" });
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const deletionResult = await Category.destroy({
                where: { id: req.params.id }
            });
            if (deletionResult) {
                res.status(200).json({ ok: true, message: "Category deleted successfully!" });
            } else {
                res.status(404).json({ ok: false, error: "Category not found!" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ ok: false, error: "Error deleting category!" });
        }
    },

    getCategories: async (req, res) => {
        try {
            const categories = await Category.findAll({
                attributes: ['id', 'name'], // Only return id and name
                order: [['id', 'DESC']]
            });
            res.status(200).json({ entities: categories });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal server error!" });
        }
    },

    getCategoryById: async (req, res) => {
        try {
            const category = await Category.findByPk(req.params.id, {
                attributes: ['id', 'name'] // Only return id and name
            });
            if (category) {
                res.status(200).json({ entity: category, ok: true });
            } else {
                res.status(404).json({ ok: false, error: "Category not found!" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal server error!" });
        }
    },
};
