const {
        Questionnaire,
        UserQuestionnaire,
    } = require('../../lib/questionnaire');
//const Token = require('../../core/token');

module.exports = {
    Query: {
        async questionnaire (_, { id }, { token }) {
            // Token.validateSession(token);
            return await Questionnaire.get({ id });
        },
        async questionnaires (_, {}, { token }) {
            // Token.validateSession(token);
            return await Questionnaire.list();
        },
        async fullQuestionnaire (_, { id }, { token }) {
            if (!id) return;
            // Token.validateSession(token);
            return await Questionnaire.getFull({ id });
        },
        async userQuestionnaire (_, { id }, { token }) {
            // Token.validateSession(token);
            return await UserQuestionnaire.get({ id });
        },
        async fullUserQuestionnaire (_, { id }, { token }) {
            // Token.validateSession(token);
            return await UserQuestionnaire.getFull({ id });
        },
    },
    Mutation: {
        async spreadQuestionnaire (_, { data }, { token }) {
            // Token.validateSession(token);
            return await Questionnaire.spread(data);
        },
        async spreadUserQuestionnaire (_, { data }, { token }) {
            // Token.validateSession(token);
            return await UserQuestionnaire.spread(data);
        }
    }
};