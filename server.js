const {GraphQLServer} = require('graphql-yoga'),
    express = require('express'),
    { PubSub } = require('graphql-yoga'),
    IORedis = require('ioredis'),
    wifi = require('node-wifi');

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

wifi.init({ iface: null });

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
        type Mutation
        
        type VoiceCommand {
            type: String
            payload: String
        }

        type Network {
            ssid: String
            bssid: String
            mac: String
            channel: Float
            frequency: Float
            signal_level: Float
            quality: Float
            security: String
            security_flags: [String]
            mode: String
        }

        input NetworkInput {
            ssid: String
            bssid: String
            mac: String
            channel: Float
            frequency: Float
            signal_level: Float
            quality: Float
            security: String
            security_flags: [String]
            mode: String
        }
        
        extend type Query {
            ping: String
            networks: [Network]
        }

        extend type Mutation {
            setNetwork(network: NetworkInput!, password: String!): Boolean
        }
        
        extend type Subscription {
            voiceEvents: VoiceCommand
        }
    `,
    resolvers: {
        Query: {
            ping: () => 'pong',
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