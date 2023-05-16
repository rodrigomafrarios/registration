import * as fs from 'fs';

import { makeExecutableSchema } from '@graphql-tools/schema';

import path = require('path');

const typeDefs = fs.readFileSync(path.join(__dirname, "../schema.graphql")).toString()
 
export const schema = makeExecutableSchema({
  typeDefs
})
