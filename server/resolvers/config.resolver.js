const wifi = require('node-wifi');

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
        setNetwork: (_, { network, password }) => {
            console.log(network, password);
            return true;
        }
    }
};