import { Construct } from 'constructs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { AuthorizationType, GraphqlApi, SchemaFile } from 'aws-cdk-lib/aws-appsync';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';

import { InviteNestedStack } from './resources/invite/invite-nested-stack';

import path = require('path');
interface GraphqlStackProps extends StackProps {
  globalTable: Table
  userPool: UserPool
}

export class GraphqlStack extends Stack {
  constructor(scope: Construct, id: string, props: GraphqlStackProps) {
    super(scope, id, props)

    const { userPool, globalTable } = props

    const senderEmail = "rodrigomafrarios@gmail.com"

    const { createInviteFunction } = new InviteNestedStack(this, "InviteNestedStack", { ...props, senderEmail })
    globalTable.grantReadWriteData(createInviteFunction)

    const graphqlApi = new GraphqlApi(this, "graphql-api-id", {
      name: "graphql-api-registration",
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool
          }
        }
      },
      schema: SchemaFile.fromAsset(path.join(__dirname, "../src/graphql/schema.graphql")),
      xrayEnabled: true,
    })

    graphqlApi.createResolver("MutationcreateInviteResolver", {
      typeName: 'Mutation',
      fieldName: 'createInvite',
      dataSource: graphqlApi.addLambdaDataSource("createInviteDatasource", createInviteFunction, { name: "MutationcreateInviteResolver" })
    })

    // Prints out the AppSync GraphQL endpoint to the terminal
    new CfnOutput(this, "GraphQLAPIURL", {
     value: graphqlApi.graphqlUrl
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new CfnOutput(this, "GraphQLAPIKey", {
      value: graphqlApi.apiId || ''
    });
  }
}