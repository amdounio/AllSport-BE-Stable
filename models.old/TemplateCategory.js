const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import sequelize instance

class TemplateCategory extends Model {}

TemplateCategory.init(
    {
        templateId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Templates', // Adjust the table name if necessary
                key: 'id',
            },
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Categories', // Adjust the table name if necessary
                key: 'id',
            },
        },
    },
    {
        sequelize,
        modelName: 'TemplateCategory',
        timestamps: false,
        tableName: 'TemplateCategory', // Explicitly specify the table name if necessary
    }
);

module.exports = TemplateCategory;
