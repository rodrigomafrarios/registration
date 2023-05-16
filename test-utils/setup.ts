import mockdate from 'mockdate';

import { getServer } from './apollo-server';
import { getClient } from './apollo-client';

global.apolloClient
global.apolloServer

beforeAll(() => {
  global.apolloServer = getServer()
  global.apolloServer.listen()
  global.apolloClient = getClient()
})

afterAll(() => {
  global.apolloServer.stop()
  global.apolloClient.stop()
})

let uuidVal = 0
jest.mock("uuid", () => {
  return {
    v4: () =>
      `00000000-0000-3333-5555-${(uuidVal++).toString(16).padStart(12, "0")}`,
  }
})

mockdate.set(new Date("2022-01-03T17:00:00.000Z"))

let nanoidVal = 0
jest.mock("nanoid", () => { return {
  nanoid : (length = 21) => (nanoidVal++).toString().padStart(length, "0")
} });

beforeEach(() => {
  nanoidVal = 0
  uuidVal = 0
})