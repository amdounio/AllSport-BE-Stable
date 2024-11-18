const { Sequelize } = require("sequelize");
const db = require("../config/db");
//const resetTokenModel = require("../models/resetToken");
//const ResetToken = resetTokenModel(db, Sequelize);

// Import models
const templateModel = require("../models/Template");
const categoryModel = require("../models/Category");
const matchModel = require("../models/Match");
const UserModel = require('../models/User');

const ProductModel = require('../models/Product');
const SubscriptionModel = require('../models/Subscription');

const User = UserModel(db, Sequelize);
const Product = ProductModel(db, Sequelize);
const Subscription = SubscriptionModel(db, Sequelize);

// Initialize models
const Template = templateModel(db, Sequelize);
const Category = categoryModel(db, Sequelize);
const Match = matchModel(db, Sequelize);

// RELATIONS

// A Template belongs to a Category (One-to-Many)
// In your index.js (or where you define your models)


// Associations
User.hasMany(Subscription, {
    as: 'subscriptions',
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Subscription.belongsTo(User, {
    as: 'user',
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Product.hasMany(Subscription, {
    as: 'subscriptions',
    foreignKey: 'product_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Subscription.belongsTo(Product, {
    as: 'product',
    foreignKey: 'product_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});



// If you want to establish a many-to-many relationship
// Uncomment the following lines if needed

// const TemplateCategory = require("../models/templateCategory"); // Create a new model for the junction table
// Template.belongsToMany(Category, {
//     through: TemplateCategory,
//     onDelete: "CASCADE",
//     onUpdate: "CASCADE",
// });
// Category.belongsToMany(Template, {
//     through: TemplateCategory,
//     onDelete: "CASCADE",
//     onUpdate: "CASCADE",
// });

db.sync({ alter: true })
    .then(async () => {
        console.log("Template and Category tables updated successfully !!!!!!");
    })
    .catch((e) => {
        console.log(e);
    });

module.exports = {
    db,
    Template,
    Category,
    Match,
    Product,
    Subscription,
    User
};
