module.exports = (db, type) => {
    return db.define("match", {
        // Optionally, you can add an id field explicitly if it's not auto-generated
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        data: {
            type: type.TEXT('long'), // TEXT with unlimited length
            allowNull: false,
        },
        user_id: {
            type: type.INTEGER, // Assuming user_id is an INTEGER
            allowNull: false
        },
        createdAt: {
            type: type.DATE,
            defaultValue: type.NOW,
        },
        updatedAt: {
            type: type.DATE,
            defaultValue: type.NOW,
        }
    }, {
        engine: 'InnoDB', // Optionally define InnoDB engine
    });
};
