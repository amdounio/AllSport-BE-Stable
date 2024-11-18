module.exports = (db, type) => {
    return db.define('Product', {
        id: {
            type: type.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: type.STRING,
            allowNull: false,
        },
        stripe_product_id: {
            type: type.STRING,
            allowNull: false,
            unique: true,
        },
        stripe_price_id: {
            type: type.STRING,
            allowNull: false,
            unique: true,
        },
        price: {
            type: type.FLOAT,
            allowNull: false,
        },
        createdAt: {
            type: type.DATE,
            defaultValue: type.NOW,
        },
        updatedAt: {
            type: type.DATE,
            defaultValue: type.NOW,
        },
    }, {
        tableName: 'products',
        timestamps: true,
        engine: 'InnoDB', // Optionally define InnoDB engine
    });
};
