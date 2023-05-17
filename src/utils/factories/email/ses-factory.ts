import * as SES from 'aws-sdk/clients/ses';

export const sesClientFactory = () => {
  if (process.env.NODE_ENV === "test") {
    return new SES({
      endpoint: "http://127.0.0.1:4566",
      region: process.env.AWS_REGION
    })
  }

  return new SES({
    region: process.env.AWS_REGION
  })
}