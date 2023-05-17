import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Stack, StackProps } from 'aws-cdk-lib';

import path = require('path');
interface InvitationNestedStackProps extends StackProps {
  globalTable: Table
  senderEmail: string
}

export class InvitationNestedStack extends Stack {

  public createInvitationFunction: NodejsFunction

  constructor(scope: Construct, id: string, props: InvitationNestedStackProps) {
    super(scope, id, props)

    const { senderEmail, globalTable } = props

    this.createInvitationFunction = new NodejsFunction(this, "CreateInvitation", {
      entry: path.join(
        __dirname,
        "../../../src/graphql/resolvers/invitation/create-invitation.ts"
      ),
      handler: "createInvitation",
      runtime: Runtime.NODEJS_18_X,
      environment: {
        GLOBAL_TABLE: globalTable.tableName,
        EMAIL_SENDER: senderEmail
      }
    })

    // as a pre requisite you should already have an config set
    this.createInvitationFunction.addToRolePolicy(
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