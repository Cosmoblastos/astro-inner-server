const model = require('../models/user'),
    crs = require('crypto-random-string'),
    { Op } = require('sequelize');

class User {
    static async get ({ id }) {
        try {
            const filter = {};
            if (id) filter.id;
            if (!Object.keys(filter).length) throw new Error('No filter provided');

            let user = await model.User.findOne({ where: filter });
            if (user) user = user.get({ plain: true });
            return user;
        } catch (error) {
            console.error(error);
        }
    }

    static async create (input) {
        try {
            if (!input.id) input.id = crs({ type: 'url-safe', length: 10 });
            await model.User.create(input);
            return await this.get({ id: input.id });
        } catch (error) {
            console.error(error);
        }
    }

    static processFilter (filter) {
        let where = {};
        for (const key in filter) {
            switch (key) {
                case 'fullName':
                    where = {
                        ...where,
                        [Op.and]: filter.query.trim().split(' ').map(query => ({
                            [Op.or]: [
                                {
                                    firstName: {
                                        [Op.like]: `%${query}%`
                                    }
                                },
                                {
                                    lastName: {
                                        [Op.like]: `%${query}%`
                                    }
                                },
                            ]
                        }))
                    };
                    break;
                case 'createdAt':
                    where.createdAt = filter.createdAt;
                    break;
                default:
                    continue;
            }
        }
        return where;
    }

    static async list (filter, options) {
        try {
            if (!filter) filter = {};
            if (!options) options = {};
            const where = this.processFilter(filter),
                order = options.ord ? [[options.ord, options.asc ? 'ASC' : 'DESC']] : [['updatedAt', 'DESC']],
                limit = options.num || 5,
                offset = (options.pag || 0) * limit;
            let rows = await model.User.findAll({ where, order, limit, offset });
            if (rows) rows = rows.map(r => r.get({ plain: true }));
            return rows;
        } catch (error) {
            console.error(error);
        }
    }

    static async count (filter) {
        try {
            if (!filter) filter = {};
            const where = this.processFilter(filter);
            const total = await model.User.count({ where });
            return total;
        } catch (error) {
            console.error(error);
        }
    }
}

exports.User = User;

module.exports = {
    User
}