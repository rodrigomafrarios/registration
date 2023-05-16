import ApolloClient from 'apollo-boost';

export const getClient = (token?: string) => {
  const client = new ApolloClient({
    uri: "http://localhost:4000/",
    onError: (): void => { return },
  })
  return client
}