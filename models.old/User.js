// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true, // Validate as email format
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true, // Can be null for SSO users
    },
    ssoData: {
        type: DataTypes.JSON, // Store SSO info
        allowNull: true,
    }
}, {
    tableName: 'users',
    timestamps: true,
});

module.exports = User;
