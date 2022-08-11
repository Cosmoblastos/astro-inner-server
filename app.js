const {GraphQLServer} = require('graphql-yoga'),
    express = require('express'),
    resolvers = require('./server/resolvers'),
    typeDefs = require('./server/typedefs');

const PORT = 4000;

const server = new GraphQLServer({
    typeDefs,
    resolvers,
});

server.express.use(express.json());

server.express.use(async (req, res, next) => {
    next();
});

server.start({ port: PORT }).then(() => {
    console.log(`Server ready 🤖 at port: ${PORT}`);
});