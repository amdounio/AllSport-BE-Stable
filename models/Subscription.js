module.exports = (db, type, User, Product) => {
    const Subscription = db.define('Subscription', {
        id: {
            type: type.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: type.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        product_id: {
            type: type.INTEGER,
            allowNull: false,
            references: {
                model: Product,
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        stripe_subscription_id: {
            type: type.STRING,
            allowNull: false,
            unique: true,
        },
        status: {
            type: type.STRING,
            allowNull: false,
        },
        start_date: {
            type: type.DATE,
            allowNull: false,
        },
        end_date: {
            type: type.DATE,
            allowNull: false,
        },
        createdAt: {
            type: type.DATE,
            defaultValue: type.NOW,
            allowNull: false,
        },
        updatedAt: {
            type: type.DATE,
            defaultValue: type.NOW,
            allowNull: false,
        },
    }, {
        tableName: 'subscriptions',
        timestamps: true,
        engine: 'InnoDB', // Optional: specify storage engine
    });



    return Subscription;
};
