const crs = require('crypto-random-string');
const { redisPublisher, pubsub } = require('./core');

class Voice {
    static async voiceInstruction (instruction) {
        try {
            const responseId = crs({ type: 'url-safe', length: 30 });
            redisPublisher.publish('voiceInstruction', JSON.stringify({
                responseId,
                instruction,
            }));
            return pubsub.asyncIterator(`voiceInstructionResponse:responseId=${responseId}`)
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = Voice;