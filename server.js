const {GraphQLServer} = require('graphql-yoga'),
    express = require('express'),
    { PubSub } = require('graphql-yoga'),
    IORedis = require('ioredis');

const pubsub = new PubSub();
const redis = new IORedis({
    user: "",
    password: "",
    host: "127.0.0.1",
    port: 6379,
    db: 13,
    url: "redis://127.0.0.1:6379/13",
    maxRetriesPerRequest: 1,
});

redis.subscribe('voiceEvents', (err, count) => {
    if (err) {
        console.error('Faild to subscribe', err.message);
    } else {
        console.log('Subscribed successfully');
    }
});

redis.on('error', (error) => {
    console.error(error);
});

redis.on('message', (channel, message) => {
    if (!message) return;
    console.log('Message recieved from ', channel);
    console.log(message);
    const data = JSON.parse(message);
    pubsub.publish('voiceEvents', {
        voiceEvents: data
    })
});

const server = new GraphQLServer({
    typeDefs: `
        type Query
        type Subscription
        
        type VoiceCommand {
            type: String
            payload: String
        }
        
        extend type Query {
            ping: String
        }
        
        extend type Subscription {
            voiceEvents: VoiceCommand
        }
    `,
    resolvers: {
        Query: {
            ping: () => 'pong',
        },
        Subscription: {
            voiceEvents: {
                subscribe: () => pubsub.asyncIterator('voiceEvents')
            }
        }
    },
});

server.express.use(express.json());

server.express.use(async (req, res, next) => {
    next();
});

server.start({ port: 4000 }).then(() => {
    console.log('server ready');
});