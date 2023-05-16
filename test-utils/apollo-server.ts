import * as fs from 'fs';
import { ApolloServer } from 'apollo-server';

import { makeExecutableSchema } from '@graphql-tools/schema';

import resolvers from '../src/graphql/resolvers';
import { EmailNotValidError } from '../src/errors';

import path = require('path');

const typeDefs = fs.readFileSync(path.join(__dirname, "../src/graphql/schema.graphql")).toString()
 
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

let request: any

export const getServer = () => 
new ApolloServer({
  typeDefs,
  resolvers,
  schema,
  context: ({ req }) => {
    request = req
    return { req }
  },
  rootValue: (root: any) => ({ ...root, arguments: request.body.variables }),
  formatError: (error) => {
    if (error.originalError?.name === "EmailNotValidError") {
      return new EmailNotValidError()
    }

    return error;
  }
})