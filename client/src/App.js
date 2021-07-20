import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import SearchBooks from "./pages/SearchBooks";
import SavedBooks from "./pages/SavedBooks";
import Navbar from "./components/Navbar";

//import required apollo client tools
import {
  ApolloProvider, //React component that is used to provide data to other components
  ApolloClient, //Constructor function to initialized connection to GraphQL API
  InMemoryCache, //Allows Apollo to cache requests for increased efficiency
  createHttpLink, //Gives control on an Apollo client request, middleware for outbound requests
} from "@apollo/client";

//import setContext for the apollo link
import { setContext } from "@apollo/client/link/context";

function App() {
  //*** Connect to the graphql Apollo back-end by creating a link to the backend
  //*** Have to create PROXY in package.json
  const httpLink = createHttpLink({ uri: "/graphql" });

  //*** Create the authorized link with the proper header
  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem("id_token");

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  //*** Create an ApolloClient instance with the backend connection and a new cache object
  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  return (
    <ApolloProvider client={client}>
      <Router>
        <>
          <Navbar />
          <Switch>
            <Route exact path="/" component={SearchBooks} />
            <Route exact path="/saved" component={SavedBooks} />
            <Route render={() => <h1 className="display-2">Wrong page!</h1>} />
          </Switch>
        </>
      </Router>
    </ApolloProvider>
  );
}

export default App;
