const express = require("express");
const path = require("path");
const db = require("./config/connection");

//import ApolloServer from the Apollo library along with typeDefs and resolvers
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require("./schemas/index");
const { authMiddleware } = require("./utils/auth");

const app = express();
const PORT = process.env.PORT || 3001;

//create a new Apollo server and pass in our schema data and integrate Apollo with express server as middleware
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});
server.start().then(() => {
  server.applyMiddleware({ app });
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

db.once("open", () => {
  app.listen(PORT, () => {
    console.log(`Listening on localhost:${PORT}`);
    console.log(`Use graphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
