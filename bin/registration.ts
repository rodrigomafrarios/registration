#!/usr/bin/env node
import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';

import { RegistrationStack } from '../lib/registration-stack';
import { InviteStack } from '../lib/invite-stack';
import { GlobalStack } from '../lib/global-stack';

const app = new cdk.App();


const { userPool } = new RegistrationStack(app, 'RegistrationStack', {
  identityProviders: {},
  cognitoUserPoolRedirectURI: "example.com",
  env: {
    region: "eu-central-1"
  }
});

const { globalTable, graphqlApi } = new GlobalStack(app, "GlobalStack", {
  userPool,
  env: {
    region: "eu-central-1"
  }
})

new InviteStack(app, "InviteStack", {
  globalTable,
  graphqlApi,
  env: {
    region: "eu-central-1"
  }
})
