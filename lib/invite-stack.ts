import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import {
    CfnDataSource, CfnResolver, FunctionRuntime, GraphqlApi, Resolver
} from 'aws-cdk-lib/aws-appsync';
import { Stack, StackProps } from 'aws-cdk-lib';

import path = require('path');
interface InviteStackProps extends StackProps {
  globalTable: Table
  graphqlApi: GraphqlApi
}

export class InviteStack extends Stack {
  constructor(scope: Construct, id: string, props: InviteStackProps) {
    super(scope, id, props)

    const { globalTable, graphqlApi } = props
    
    const createInvite = new NodejsFunction(this, "CreateInvite", {
      entry: path.join(
        __dirname,
        "../src/invite/create-invite.ts"
      ),
      handler: "handler",
      environment: {
        GLOBAL_TABLE: globalTable.tableName
      },
      role: new Role(this, "AppSync-InvokeLambdaRole", {
        assumedBy: new ServicePrincipal("appsync.amazonaws.com"),
      })
    })

    globalTable.grantReadWriteData(createInvite)

    const appSyncRole = new Role(this, "AppSync-InvokeLambdaRole", {
      assumedBy: new ServicePrincipal("appsync.amazonaws.com"),
    })

    createInvite.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [createInvite.functionArn],
        actions: ["lambda:InvokeFunction"]
      })
    )

    graphqlApi.addLambdaDataSource("create-invite-datasource", createInvite)
    
    graphqlApi.createResolver("create-invite", {
      runtime: FunctionRuntime.JS_1_0_0,
      typeName: 'Mutation',
      fieldName: 'createInvite'
    })
    
  }
}