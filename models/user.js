const Sequelize = require('sequelize'),
    core = require('../lib/core');

class User extends Sequelize.Model {}

User.init({
    id: {
        type: Sequelize.STRING(10),
        primaryKey: true
    },
    fullName: {
        type: Sequelize.VIRTUAL,
        get() {
            return `${this.getDataValue('firstName')} ${this.getDataValue('lastName')}`
        }
    },
    firstName: {
        type: Sequelize.STRING(60),
        allowNull: false,
    },
    lastName: {
        type: Sequelize.STRING(50),
        allowNull: true
    },
    color: {
        type: Sequelize.STRING(50),
        allowNull: true
    },
}, {
    sequelize: core.db,
    timestamps: true,
    paranoid: true
});

exports.User = User;

exports.sync = async (options = {force: false, alter: true}) => {
    console.log('User sync');
    await User.sync(options);
};