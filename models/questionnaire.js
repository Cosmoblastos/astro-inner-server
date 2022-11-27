const Sequelize = require('sequelize'),
    core = require('../lib/core'),
    user = require('./user');

class Questionnaire extends Sequelize.Model {}

Questionnaire.init({
    id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: Sequelize.STRING(256),
        allowNull: false,
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    //Texto rico
    instructions: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    //Puntuación para estatus de salud malo
    bad: {
        type: Sequelize.STRING(10),
        defaultValue: 0,
        //Métodos para manejar este valor de forma virtual como un rango numérico en forma de array.
        set (v) {
            const [low, high] = v;
            this.setDataValue('bad', `${low}-${high}`);
        },
        get () {
            let storedValue = this.getDataValue('bad');
            storedValue = storedValue.split('-');
            return storedValue;
        }
    },
    //Recomendación textual para la persona en caso de tener una salud nivel malo
    recommendationBad: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    //Puntuación para estatus de salud medio
    medium: {
        type: Sequelize.STRING(10),
        defaultValue: 0,
        set (v) {
            const [low, high] = v;
            this.setDataValue('medium', `${low}-${high}`);
        },
        get () {
            let storedValue = this.getDataValue('medium');
            storedValue = storedValue.split('-');
            return storedValue;
        }
    },
    //Recomendación textual para la persona en caso de tener una salud nivel medio
    recommendationMedium: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    //Puntuación para estatus de salud bueno
    good: {
        type: Sequelize.STRING(10),
        defaultValue: 0,
        set (v) {
            const [low, high] = v;
            this.setDataValue('good', `${low}-${high}`);
        },
        get () {
            let storedValue = this.getDataValue('good');
            storedValue = storedValue.split('-');
            return storedValue;
        }
    },
    //Recomendación textual para la persona en caso de tener una salud nivel alto
    recommendationGood: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    //Cada cuanto se debe hacer este cuestionario? (en días) (0 para no periodicidad)
    periodicity: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
}, {
    sequelize: core.db,
    paranoid: true,
    timestamps: true,
});

exports.Questionnaire = Questionnaire;

class Question extends Sequelize.Model {}

Question.init({
    id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: Sequelize.STRING(256),
        allowNull: false,
    },
    auxInfo: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
    },
    order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
}, {
    sequelize: core.db,
    paranoid: true,
    timestamps: true,
});

Question.belongsTo(Questionnaire, {
    as: 'questionnaire',
    onDelete: 'CASCADE',
    foreignKey: {
        name: 'questionnaireId',
        allowNull: false
    }
});

exports.Question = Question;

class Option extends Sequelize.Model {}

Option.init({
    id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
    },
    //Nombre de la opción
    name: {
        type: Sequelize.STRING(256),
        allowNull: false,
    },
    //Que tipo de puntaje da esta opción?
    punctuationType: {
        type: Sequelize.ENUM('bad', 'medium', 'good'),
        allowNull: false,
    },
    //Cantidad en puntuación
    punctuation: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    //Orden en que aparecerá la opción
    order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
}, {
    sequelize: core.db,
    paranoid: true,
    timestamps: true,
});

Option.belongsTo(Question, {
    as: 'question',
    onDelete: 'CASCADE',
    foreignKey: {
        name: 'questionId',
        allowNull: false
    }
});

exports.Option = Option;

class UserQuestionnaire extends Sequelize.Model {}

UserQuestionnaire.init({
    id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
    },
    status: {
        type: Sequelize.ENUM('ongoing', 'finished'),
        allowNull: false,
        defaultValue: 'ongoing'
    },
    percentage: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    punctuation: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    result: {
        type: Sequelize.ENUM('bad', 'medium', 'good'),
        allowNull: true
    }
}, {
    sequelize: core.db,
    paranoid: true,
    timestamps: true,
});

UserQuestionnaire.belongsTo(user.User, {
    as: 'user',
    onDelete: 'CASCADE',
    foreignKey: {
        name: 'userId',
        allowNull: false
    }
});

UserQuestionnaire.belongsTo(Questionnaire, {
    as: 'questionnaire',
    onDelete: 'CASCADE',
    foreignKey: {
        name: 'questionnaireId',
        allowNull: false
    }
});

exports.UserQuestionnaire = UserQuestionnaire;

class UserQuestion extends Sequelize.Model {}

UserQuestion.init({
    id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false,
    }
}, {
    sequelize: core.db,
    timestamps: true,
});

UserQuestion.belongsTo(UserQuestionnaire, {
    as: 'userQuestionnaire',
    onDelete: 'CASCADE',
    foreignKey: {
        name: 'userQuestionnaireId',
        allowNull: false
    }
})

UserQuestion.belongsTo(Question, {
    as: 'question',
    onDelete: 'CASCADE',
    foreignKey: {
        name: 'questionId',
        allowNull: false
    }
})

UserQuestion.belongsTo(Option, {
    as: 'answer',
    foreignKey: {
        name: 'answerId',
        allowNull: false
    }
});

exports.UserQuestion = UserQuestion;


exports.sync = async (opt = { alter: true }) => {
    await Questionnaire.sync(opt);
    console.log('Questionnaire synced');
    await Question.sync(opt);
    console.log('Question synced');
    await Option.sync(opt);
    console.log('Option synced');
    await UserQuestionnaire.sync(opt);
    console.log('UserQuestionnaire synced');
    await UserQuestion.sync(opt);
    console.log('UserQuestion synced');
};