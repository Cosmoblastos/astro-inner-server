const voice = require('../../lib/voice');
const {pubsub} = require("../../lib/core");

const instruction_set = [
    {
        say: 'Hello, I\'m Astro, your personal medical assistant',
    },
    {
        say: 'What is your name?',
        waitForResponse: true,
    },
    {
        say: `Nice to meet you, Alejandro, I'm going to guide you through a set questions to know a little more about you`,
    }
];

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