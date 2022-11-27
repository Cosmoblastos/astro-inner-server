const { db } = require('../lib/core'),
    Sequelize = require('sequelize'),
    user = require('./user');

class MedicalProfile extends Sequelize.Model {}

MedicalProfile.init({
    id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
    },
    age: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    //Biological sex of the patient
    sex: {
        type: Sequelize.ENUM('male', 'female'),
        allowNull: true,
        defaultValue: null,
    },
    //In Kilograms
    weight: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    //In metters
    height: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    //Body mass index (Índice de masa corporal)
    bmi: {
        type: Sequelize.VIRTUAL,
        get () {
            const weight = this.getDataValue('weight');
            const height = this.getDataValue('height');
            if (!weight || !height) return 0;
            return weight / Math.pow(height / 100, 2);
        }
    }
}, {
    sequelize: db,
    timestamps: true,
    paranoid: true,
});

MedicalProfile.belongsTo(user.User, {
    as: 'user',
    onDelete: 'CASCADE',
    foreignKey: {
        name: 'userId',
        allowNull: false
    }
});

exports.MedicalProfile = MedicalProfile;

class Metric extends Sequelize.Model {}

Metric.init({
    id: {
        type: Sequelize.STRING(16),
        primaryKey: true,
        allowNull: false,
    },
    type: {
        type: Sequelize.STRING(100),
        allowNull: false,
    },
    metric: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    measurementDate: {
        type: Sequelize.DATE,
        allowNull: false,
    }
}, {
    sequelize: db,
});

MedicalProfile.hasMany(Metric); //TODO: validar si esta relación es necesaria.
Metric.belongsTo(user.User, {
    as: 'user',
    onDelete: 'CASCADE',
    foreignKey: {
        name: 'userId',
        allowNull: false
    }
});

exports.Metric = Metric;

exports.sync = async (opt = { alter: true }) => {
    await MedicalProfile.sync(opt);
    console.log('MedicalProfile synced');
    await Metric.sync(opt);
    console.log('Metric synced');
};