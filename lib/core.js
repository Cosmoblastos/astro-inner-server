const { Sequelize } = require('sequelize'),
    { PubSub } = require('graphql-yoga'),
    IORedis = require('ioredis'),
    wifi = require('node-wifi'),
    path = require('path');

wifi.init({ iface: null });

const db = new Sequelize({
    "logging": false,
    "dialect": "sqlite",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "",
    "database": "astro-db",
    "storage": path.join(__dirname, "../data/database.sqlite")
});

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
const redisPublisher = IORedis.createClient();

redis.subscribe('voiceEvents', (err, count) => {
    if (err) {
        console.error('Faild to subscribe', err.message);
    } else {
        console.log('Subscribed successfully to voiceEvents');
    }
});

redis.psubscribe('voiceInstructionResponse:*', (err, count) => {
   if (err) {
       console.error('Faild to subscribe', err.message);
   } else {
       console.info(`Subscribed successfully to voiceInstructionResponse*`);
   }
});

redis.on('error', (error) => {
    console.error(error);
});

redis.on('message', (channel, message) => {
    console.log('Message recieved from ', channel);
    console.log(message);
    const data = JSON.parse(message);

    if (channel === 'voiceEvents') {
        pubsub.publish('voiceEvents', {
            voiceEvents: data
        })
    }
});

redis.on('pmessage', (subscribed, channel, message) => {
    console.log(channel, message);
    pubsub.publish(channel, {
        voiceInstruction: JSON.parse(message)
    });
});


module.exports = {
    db, pubsub, redis, redisPublisher
};