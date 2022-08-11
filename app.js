const {GraphQLServer} = require('graphql-yoga'),
    express = require('express'),
    resolvers = require('./server/resolvers'),
    typeDefs = require('./server/typedefs');

const server = new GraphQLServer({
    typeDefs,
    resolvers,
});

server.express.use(express.json());

server.express.use(async (req, res, next) => {
    next();
});

server.start({ port: 4000 }).then(() => {
    console.log('server ready');
});