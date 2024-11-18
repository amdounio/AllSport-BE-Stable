// models/Category.js
module.exports = (db, type) => {
    return db.define("category", {
        name: {
            type: type.STRING,
            allowNull: false,
        },
    }, {
        engine: 'InnoDB',
    });
}
