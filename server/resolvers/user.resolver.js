const user = require('../../lib/user');

module.exports = {
    Query: {
        user: async (_, { id }) => {
            return await user.User.get({ id });
        },
        users: async (_, { filter, ord, asc, pag, num }) => {
            const data = await user.User.list(filter, { ord, asc, pag, num }),
                totalCount = await user.User.count(filter);
            return {
                totalCount,
                total: data.length,
                pag, 
                hasMore: ((pag + 1) * num < totalCount),
                data,
            }
        }
    },
    Mutation: {
        //WARN: don't use this method to create users in a production flow
        createUser: async (_, { input }) => {
            return await user.User.create(input);
        }
    }
};