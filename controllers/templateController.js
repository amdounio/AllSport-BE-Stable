// controllers/templateController.js

const { Template, Category } = require("../config/relation");

module.exports = {
    createTemplate: async (req, res) => {
        try {
            const creation = await Template.create(req.body);
            if (creation) {
                res.status(200).json(creation);
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error creating template!" });
        }
    },

    updateTemplate: async (req, res) => {
        try {
            const updateResult = await Template.update(req.body, {
                where: { id: req.params.id }
            });
            if (updateResult[0] > 0) {
                res.status(200).json({ message: "Template updated successfully!" });
            } else {
                res.status(404).json({ error: "Template not found!" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error updating template!" });
        }
    },

    deleteTemplate: async (req, res) => {
        try {
            const deletionResult = await Template.destroy({
                where: { id: req.params.id }
            });
            if (deletionResult) {
                res.status(200).json({ message: "Template deleted successfully!" });
            } else {
                res.status(404).json({ error: "Template not found!" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error deleting template!" });
        }
    },

    getTemplatesByCategory: async (req, res) => {
        const { categoryIds } = req.body; // Expecting categoryIds to be an array in the request body
    
        if (!Array.isArray(categoryIds)) {
            return res.status(400).json({ message: 'Invalid category IDs' });
        }
    
        try {
            // If categoryIds is empty, fetch all templates (no category filter)
            const whereClause = categoryIds.length ? { categoryId: categoryIds } : {};
    
            const templates = await Template.findAll({
                where: whereClause, // If categoryIds is empty, no category filter is applied
                include: [{
                    model: Category,
                    as: 'category' // Use the alias defined in the association
                }],
            });
    
            if (!templates.length) {
                return res.status(404).json({ message: 'No templates found for the specified categories' });
            }
            
            res.status(200).json(templates);
    
        } catch (error) {
            console.error('Error fetching templates by category:', error);
            res.status(500).json({ message: 'Error fetching templates' });
        }
    },    

    getAllTemplates: async (req, res) => {
        try {
            const templates = await Template.findAll({
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                order: [['id', 'DESC']]
            });
            if (templates) {
                res.status(200).json(templates);
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal server Error !! " });
        }
    },

    getOneTemplate: async (req, res) => {
        try {
            const template = await Template.findOne({
                where: { id: req.params.id },
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            });
            if (template) {
                res.status(200).json(template);
            } else {
                res.status(404).json({ error: "Template not found!" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal server Error !! " });
        }
    },
};
