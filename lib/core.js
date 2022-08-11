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


module.exports = {
    db, pubsub, redis
};