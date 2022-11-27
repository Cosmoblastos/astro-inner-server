const model= require('../models/questionnaire'),
    crs = require('crypto-random-string');

class Questionnaire  {
    static async get ({ id }) {
        try {
            let where = {};
            if (id) where.id = id;

            let questionnaire = await model.Questionnaire.findOne({ where });
            if (questionnaire) {
                questionnaire = questionnaire.get({ plain: true });
            }
            return questionnaire;
        } catch (error) {
            console.error(error);
        }
    }

    static async getFull ({ id }) {
        try {
            let where = {};
            if (id) where.id = id;

            let questionnaire = await model.Questionnaire.findOne({ where });
            if (questionnaire) questionnaire = questionnaire.get({ plain: true });
            if (!questionnaire.id) throw new Error('There are no records in questionnaires for this query');
            const questions = await model.Question.findAll({ where: { questionnaireId: questionnaire.id } });
            const questionsAndOptions = [];
            for (let question of questions) {
                question = question.get({ plain: true });
                let options = await model.Option.findAll({ where: { questionId: question.id } });
                options = options.map(opt => opt.get({ plain: true }));
                questionsAndOptions.push({ ...question, options });
            }
            questionnaire.questions = questionsAndOptions;
            return questionnaire;
        } catch (error) {
            console.error(error);
        }
    }

    static async list () {
        let data = await model.Questionnaire.findAll({ order: [['name', 'ASC']] });
        data = data.map(x => x.get({plain: true}));
        return data;
    }

    static async create (data) {
        try {
            data.id = crs({ type: 'url-safe', length: 10 });
            const questionnaire = await model.Questionnaire.create(data);
            return this.get({ id: questionnaire.id });
        } catch (error) {
            console.error(error);
        }
    }

    static async spread (data) {
        try {
            const questionnaire = await this.create(data);
            if (data.questions) if (data.questions.length > 0) {
                for (let question of data.questions) {
                    await Question.spread({
                        questionnaireId: questionnaire.id,
                        ...question
                    });
                }
            }
            return questionnaire;
        } catch (error) {
            console.error(error);
        }
    }
}

exports.Questionnaire = Questionnaire;

class Question {
    static async get ({ id }) {
        try {
            let where = {};
            if (id) where.id = id;

            let question = await model.Question.findOne({ where, plain: true });
            return question;
        } catch (error) {
            console.error(error);
        }
    }

    static async create (data) {
        try {
            data.id = crs({ type: 'url-safe', length: 10 });
            const question = await model.Question.create(data);
            return question;
        } catch (error) {
            console.error(error);
        }
    }

    static async spread (data) {
        try {
            const question = await this.create(data);
            if (data.options) if (data.options.length) {
                for (const option of data.options) {
                    await Option.create({ questionId: question.id, ...option });
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
}

exports.Question = Question;

class Option {
    static async get ({ id }) {
        try {
            let where = {};
            if (id) where.id = id;

            let option = await model.Option.findOne({ where, plain: true });
            return option;
        } catch (error) {
            console.error(error);
        }
    }

    static async create (data) {
        try {
            data.id = crs({ type: 'url-safe', length: 10 });
            const option = await model.Option.create(data);
            return option;
        } catch (error) {
            console.error(error);
        }
    }
}

exports.Option = Option;

class UserQuestionnaire {
    static async get({ id, userId, questionnaireId }) {
        let where = {};
        if (id) where.id = id;
        if (userId && questionnaireId) {
            where.userId = userId;
            where.questionnaireId = questionnaireId;
        }
        if (Object.keys(where).length === 0) throw new Error('No filter specified');

        let userQuestionnaire = await model.UserQuestionnaire.findOne({ where });
        if (userQuestionnaire) {
            userQuestionnaire = userQuestionnaire.get({ plain: true });
        }
        return userQuestionnaire;
    }

    static async getFull ({ id }) {
        let where = {};
        if (id) where.id = id;

        let userQuestionnaire = await model.UserQuestionnaire.findOne({ where });
        if (userQuestionnaire) userQuestionnaire = userQuestionnaire.get({ plain: true });
        if (!userQuestionnaire.id) throw new Error('There are no records in questionnaires for this query');
        let userQuestions = await model.UserQuestion.scope('answer').findAll({ where: { userQuestionnaireId: userQuestionnaire.id } });
        userQuestionnaire.userQuestions = userQuestions.map(q => q.get({ plain: true }));
        return userQuestionnaire;
    }

    static async create (data) {
        data.id = crs({type: 'url-safe', length: 10});
        const exists = Boolean(await this.get({
            userId: data.userId,
            questionnaireId: data.questionnaireId
        }));
        if (exists) throw new Error('This user already have this questionnaire');
        await model.UserQuestionnaire.create(data);
        return this.get({ id: data.id });
    }

    static async update (data) {
        const prev = await this.get({ id: data.id });
        if (!prev) throw new Error('Invalid id supplied to update method');
        await model.UserQuestionnaire.update(data, { where: { id: data.id } });
        return await this.get({ id: prev.id });
    }

    static async upsert (data) {
        const prev = await this.get({ userId: data.userId, questionnaireId: data.questionnaireId });
        if (prev) return await this.update(Object.assign({}, prev, data));
        return await this.create(data);
    }

    static isInRange (range, num) {
        return num >= range[0] && num <= range[1];
    }

    static async calculateProgress (questionnaireId, userQuestions) {
        const questionnaire = await Questionnaire.getFull({ id: questionnaireId });
        if (!questionnaire) throw new Error('Invalid questionnaire id');
        const result = { status: '', percentage: 0, punctuation: 0, result: '' };
        result.percentage = userQuestions.length * 100 / questionnaire.questions.length;
        result.status = result.percentage === 100 ? 'finished' : 'ongoing';
        result.punctuation = userQuestions.reduce((ac, c) => {
            return ac + parseInt(c.answer.punctuation)
        }, 0);
        result.result = this.isInRange(questionnaire.bad, result.punctuation)
                            ? 'bad'
                            : this.isInRange(questionnaire.medium, result.punctuation)
                                ? 'medium'
                                : 'good';
        return result;
    }

    static async spread (data) {
        const progress = await this.calculateProgress(data.questionnaireId, data.userQuestions);
        data = Object.assign(data, progress);
        const userQuestionnaire = await this.upsert(data);
        if (data.userQuestions) if (data.userQuestions.length > 0) {
            for (let userQuestion of data.userQuestions) {
                await UserQuestion.upsert({
                    userQuestionnaireId: userQuestionnaire.id,
                    answerId: userQuestion.answer.optionId,
                    ...userQuestion
                });
            }
        }
        return userQuestionnaire;
    }
}

exports.UserQuestionnaire = UserQuestionnaire;

class UserQuestion {
    static async get ({ id,  userQuestionnaireId, questionId }) {
        let where = {};
        if (id) where.id = id;
        if (userQuestionnaireId && questionId) {
            where.userQuestionnaireId = userQuestionnaireId;
            where.questionId = questionId;
        }

        let userQuestion = await model.UserQuestion.findOne({ where });
        if (userQuestion) {
            userQuestion = userQuestion.get({ plain: true });
        }
        return userQuestion;
    }

    static async create (data) {
        data.id = crs({type: 'url-safe', length: 10});
        const result = await model.UserQuestion.create(data);
        return result;
    }

    static async update (data) {
        const prev = await this.get({ id: data.id });
        if (!prev) throw new Error('Invalid id supplied to update method');
        const result = await model.UserQuestion.update(data, { where: { id: data.id } });
        return result;
    }

    static async upsert (data) {
        const prev = await this.get({ userQuestionnaireId: data.userQuestionnaireId, questionId: data.questionId });
        if (prev) return await this.update(Object.assign({}, prev, data));
        return await this.create(data);
    }
}

exports.UserQuestion = UserQuestion;

module.exports = {
    Questionnaire,
    Question,
    Option,
    UserQuestionnaire,
    UserQuestion
};