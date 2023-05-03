import { readFileSync } from 'fs';
import { Construct } from 'constructs';
import { AttributeType, BillingMode, ProjectionType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { AuthorizationType, GraphqlApi, SchemaFile } from 'aws-cdk-lib/aws-appsync';
import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';

interface GlobalStackProps extends StackProps {
  userPool: UserPool
}

export class GlobalStack extends Stack {
  readonly globalTable: Table
  readonly graphqlApi: GraphqlApi

  constructor(scope: Construct, id: string, props: GlobalStackProps) {
    super(scope, id, props)

    const { userPool } = props

    this.globalTable = new Table(this, "globalTable", {
      partitionKey: { name: "PK", type: AttributeType.STRING },
      sortKey: { name: "SK", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
    })
    // Inverse Index
    this.globalTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "SK", type: AttributeType.STRING },
      sortKey: { name: "PK", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    })
    // GSI2
    this.globalTable.addGlobalSecondaryIndex({
      indexName: "GSI2",
      partitionKey: { name: "GSI2PK", type: AttributeType.STRING },
      sortKey: { name: "GSI2SK", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    })
    // GSI3
    this.globalTable.addGlobalSecondaryIndex({
      indexName: "GSI3",
      partitionKey: { name: "GSI3PK", type: AttributeType.STRING },
      sortKey: { name: "GSI3SK", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    })

    this.graphqlApi = new GraphqlApi(this, "graphql-api-id", { 
      name: "graphql-api-registration",
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool
          }
        }
      },
      schema: new SchemaFile({
        filePath: readFileSync("../schema.graphql").toString()
      }),
      xrayEnabled: true
    });

    // Prints out the AppSync GraphQL endpoint to the terminal
    new CfnOutput(this, "GraphQLAPIURL", {
     value: this.graphqlApi.graphqlUrl
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new CfnOutput(this, "GraphQLAPIKey", {
      value: this.graphqlApi.apiId || ''
    });

    // Prints out the stack region to the terminal
    new CfnOutput(this, "Stack Region", {
      value: this.region
    });

    new CfnOutput(this, "globalTableName", {
      value: this.globalTable.tableName,
    })
  }
}