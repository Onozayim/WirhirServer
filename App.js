const { ApolloServer } = require("apollo-server-express");
const { createServer } = require("http");
const express = require("express");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { execute, subscribe } = require("graphql");
const mongoose = require("mongoose");
const { graphqlUploadExpress } = require("graphql-upload");

const { typeDefs } = require("./Graphql/TypeDefs2");
const { resolvers } = require("./Graphql/Resolvers");
const { MONGO_URL } = require("./Config");

const startApolloServer = async () => {
  const app = express();

  const httpServer = createServer(app);

  const schema = makeExecutableSchema({
    typeDefs: typeDefs,
    resolvers: resolvers,
  });

  const subscriptionServer = SubscriptionServer.create(
    { schema: schema, execute, subscribe },
    { server: httpServer, path: "/graphql" }
  );

  const server = new ApolloServer({
    schema: schema,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
    context: (req) => req,
  });

  await server.start();

  app.use(graphqlUploadExpress());

  server.applyMiddleware({ app });

  app.use(express.static("public"));

  const PORT = process.env.PORT || 4000;

  httpServer.listen(PORT, () => {
    console.log("server runnin at port: " + PORT);
  });
};

mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Mongo Online");
    startApolloServer();
  })
  .catch((err) => {
    console.log(err);
  });
