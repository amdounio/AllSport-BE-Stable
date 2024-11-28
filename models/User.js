module.exports = (db, type) => {
    return db.define('User', {
        // Essential fields
        id: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: type.STRING,
            allowNull: true,
        },
        email: {
            type: type.STRING,
            allowNull: true,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        photoUrl: {
            type: type.STRING,
            allowNull: true,
        },
        firstName: {
            type: type.STRING,
            allowNull: true,
        },
        lastName: {
            type: type.STRING,
            allowNull: true,
        },
        provider: {
            type: type.STRING,
            allowNull: true,
        },
        acceptLegalPolicy: {
            type: type.BOOLEAN,
            allowNull: true,
        },

        // Step two fields
        businessName: {
            type: type.STRING,
            allowNull: true,
        },
        buisnessType: {
            type: type.STRING,
            allowNull: true,
        },
        adresse: {
            type: type.STRING,
            allowNull: true,
        },
        phone: {
            type: type.STRING,
            allowNull: true,
            validate: {
                isNumeric: true,
            },
        },
        companyName: {
            type: type.STRING,
            allowNull: true,
        },

        // Step three fields
        newUser: {
            type: type.BOOLEAN,
            allowNull: true,
            defaultValue: true,
        },
        role: {
            type: type.STRING,
            allowNull: true,
        },
        plan: {
            type: type.STRING,
            allowNull: true,
        },

        // Favorite sports fields
        favoriteSport: {
            type: type.STRING,
            allowNull: true,
        },
        favoriteLeague: {
            type: type.STRING,
            allowNull: true,
        },

        // Additional fields
        establishmentCapacity: {
            type: type.STRING,
            allowNull: true,
        },
        sports: {
            type: type.STRING,
            allowNull: true,
        },
        frequencyMatchBroadcasts: {
            type: type.STRING,
            allowNull: true,
        },
        monthlyBudgetEventPromotion: {
            type: type.STRING,
            allowNull: true,
        },
        mainObjectiveUsing: {
            type: type.STRING,
            allowNull: true,
        },
        devicesUsedAccess: {
            type: type.STRING,
            allowNull: true,
        },
        commentsSpecificNeeds: {
            type: type.TEXT,
            allowNull: true,
        },

        // Generated images counter
        generatedImagesCount: {
            type: type.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },

        // Existing fields to retain
        password: {
            type: type.STRING,
            allowNull: true,
        },
        ssoData: {
            type: type.JSON,
            allowNull: true,
        },
        stripeCustomerId: {
            type: type.STRING,
            allowNull: true,
            unique: true,
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
        tableName: 'users',
        timestamps: true,
        engine: 'InnoDB',
    });
};