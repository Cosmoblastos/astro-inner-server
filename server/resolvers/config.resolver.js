const wifi = require('node-wifi'),
    { redisPublisher } = require('../../lib/core');

module.exports = {
    Query: {
        networks: async () => {
            let list = await wifi.scan();
            list = list.sort((a, b) => {
                if (a.quality > b.quality) return -1;
                if (a.quality < b.quality) return 1;
                return 0;
            });
            return list;
        }
    },
    Mutation: {
        setNetwork: async (_, { network, password }) => {
            try {
                await wifi.connect({ ssid: network, password });
                await redisPublisher.publish('SET_WIFI', JSON.stringify({
                    network, password
                }));
                return true;
            } catch (error) {
                console.log(error);
                return false;
            }
        }
    }
};