import { Construct } from 'constructs';
import { AttributeType, BillingMode, ProjectionType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';

export class GlobalStack extends Stack {
  readonly globalTable: Table

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

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

    // Prints out the stack region to the terminal
    new CfnOutput(this, "Stack Region", {
      value: this.region
    });

    new CfnOutput(this, "globalTableName", {
      value: this.globalTable.tableName,
    })
  }
}