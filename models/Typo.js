module.exports = (db, type) => {
    return db.define("typo", {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true, // Automatically increments with each new record
        },
        name: {
            type: type.STRING(255), // Limit the name length to 255 characters
            allowNull: false, // Ensure the name cannot be null
        },
        // Define the `subscription_plan` field as a string (VARCHAR)
        subscription_plan: {
            type: type.STRING(255), // Limit the subscription_plan length to 255 characters
            allowNull: false, // Ensure the subscription plan cannot be null
        },
        createdAt: {
            type: type.DATE,
            defaultValue: type.NOW, // Default value to the current date and time
        },
        updatedAt: {
            type: type.DATE,
            defaultValue: type.NOW, // Default value to the current date and time
        }
    }, {
        engine: 'InnoDB', // Optionally define InnoDB engine
    });
};
