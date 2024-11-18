// models/Template.js
module.exports = (db, type) => {
    return db.define("template", {
        name: {
            type: type.STRING,
            allowNull: false,
        },
        premium: {
            type: type.BOOLEAN,
            defaultValue: false,
        },
        image: {
            type: type.STRING,
            allowNull: true,
        },
        content: {
            type: type.TEXT('long'),
            allowNull: false,
        },
    }, {
        engine: 'InnoDB',
    });
}
