const { Op } = require('sequelize');
const crs = require('crypto-random-string'),
    model = require('../models/medical');

class MedicalProfile {
    static async get ({ id, userId }) {
        let where = {};
        if (id) where.id = id;
        else if (userId) where.userId = userId;

        let medicalProfile = await model.MedicalProfile.findOne({ where });
        if (medicalProfile) {
            medicalProfile = medicalProfile.get({ plain: true });
        }
        return medicalProfile;
    }

    //TODO: corregir la lógica de este upsert
    static async upsert (data) {
        //if (!data.id) throw new Error('No id specified');
        const exists = Boolean(await this.get({ id: data.id }));
        if (!exists) throw new Error('The specified model.MedicalProfile doesnt exists');
        if (data.user) data.userId = data.user.id;
        await model.MedicalProfile.upsert(data);
        return await this.get({ id: data.id })
    }
                                                                      
    static async create (data) {
        if (!data.userId) throw new Error('No user specified');
        data.id = crs({ type: 'url-safe', length: 10 });
        const medicalProfileExists = await this.get({ userId: data.userId });
        if (medicalProfileExists) throw new Error('There are already a medical profile for this user');
        await model.MedicalProfile.create(data);
        return await this.get({ id: data.id });
    }


    /**
     * 
     * @param {*} data 
     * @returns 
     */
    static async update (data) {
        if (!data.id) throw new Error('No id specified');
        const exists = Boolean(await this.get({ id: data.id }));
        if (!exists) throw new Error('The specified model.MedicalProfile doesnt exists');
        if (data.user) data.userId = data.user.id;
        await model.MedicalProfile.update(data, { where: { id: data.id } });
        return await this.get({ id: data.id });
    }
}

exports.MedicalProfile = MedicalProfile;

class Metric {
    /**
     * 
     * @param {Object} param0
     * @param {String} param0.id
     * @param {String} param0.userId
     * @param {String} param0.timeType - latest / further
     * @returns {}
     */
    static async get ({ id, userId, asc= false }) {        
        let where = {}, order = [];
        if (id) where.id = id;
        if (userId || asc) {
            if (!userId) throw new Error('No user specified');
            where.userId = userId;
            order.push(['measurementDate', asc ? 'ASC' : 'DESC']);
        }

        let metric = await model.Metric.findOne({ where, order });
        if (metric) {
            metric = metric.get({ plain: true });
        }
        return metric;
    }

    static async create (data) {
        data.id = crs({ type: 'url-safe', length: 16 });
        await model.Metric.create(data);
        return await this.get({ id: data.id });
    }

    static async statistics ({ type, startDate, endDate, userId }, options) {
        let results = await model.Metric.findAll({ where: {
            type, userId, measurementDate: {[Op.between]: [startDate, endDate]}
        }, order: [['measurementDate', options.asc ? 'DESC' : 'ASC']]});
        results = results.map(r => r.get({ plain: true }));
        return results;
    }
}

exports.Metric = Metric;

module.exports = { MedicalProfile, Metric };