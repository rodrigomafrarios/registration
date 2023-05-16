import { DynamoDB } from 'aws-sdk';

export const DynamoDBClientFactory = (): DynamoDB.DocumentClient => {
  if (process.env?.NODE_ENV === "test") {
    return new DynamoDB.DocumentClient({
      endpoint: 'http://localhost:8000',
      apiVersion: '2012-08-10',
      sslEnabled: false,
      region: 'local-env',
      credentials: {
        accessKeyId: 'fakeMyKeyId',
        secretAccessKey: 'fakeSecretAccessKey',
      }
    }) 
  }

  return new DynamoDB.DocumentClient()
}