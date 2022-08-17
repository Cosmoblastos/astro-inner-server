const voice = require('../../lib/voice');
const {pubsub} = require("../../lib/core");

module.exports = {
    Subscription: {
        voiceEvents: {
            subscribe: () => pubsub.asyncIterator('voiceEvents')
        },
        voiceInstruction: {
            //Esta función tiene que recibir lo que tiene que decir astro, por lo que tiene que esperar, y lo que tiene que hacer.
            subscribe: (_, { instruction }, { pubsub }) => {
                return voice.voiceInstruction(instruction)
            }
        },
    }
};