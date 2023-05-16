import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Stack, StackProps } from 'aws-cdk-lib';

import path = require('path');
interface InviteNestedStackProps extends StackProps {
  globalTable: Table
  senderEmail: string
}

export class InviteNestedStack extends Stack {

  public createInviteFunction: NodejsFunction

  constructor(scope: Construct, id: string, props: InviteNestedStackProps) {
    super(scope, id, props)

    const { senderEmail, globalTable } = props

    this.createInviteFunction = new NodejsFunction(this, "CreateInvite", {
      entry: path.join(
        __dirname,
        "../../../src/graphql/resolvers/invite/create-invite.ts"
      ),
      handler: "createInvite",
      runtime: Runtime.NODEJS_18_X,
      environment: {
        GLOBAL_TABLE: globalTable.tableName,
        EMAIL_SENDER: senderEmail
      }
    })

    // as a pre requisite you should already have an config set
    this.createInviteFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'ses:SendEmail',
          'ses:SendRawEmail',
          'ses:SendTemplatedEmail',
        ],
        resources: [
          `arn:aws:ses:${props.env?.region}:${
            props.env?.account
          }:identity/${senderEmail}`,
        ],
      }),
    )

  }
}