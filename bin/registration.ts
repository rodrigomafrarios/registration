#!/usr/bin/env node
import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';

import { RegistrationStack } from '../lib/registration-stack';
import { GraphqlStack } from '../lib/graphql-stack';
import { GlobalStack } from '../lib/global-stack';

const app = new cdk.App();

const { userPool } = new RegistrationStack(app, 'RegistrationStack', {
  identityProviders: {},
  cognitoUserPoolRedirectURI: "example.com",
  env: {
    region: "eu-central-1"
  }
});

const { globalTable } = new GlobalStack(app, "GlobalStack", {
  env: {
    region: "eu-central-1"
  }
})

new GraphqlStack(app, "GraphqlStack", {
  globalTable,
  userPool,
  env: {
    region: "eu-central-1"
  }
})