import { DynamoDBClientFactory } from '../utils/factories';

const dynamodb = DynamoDBClientFactory()

export class Invitation {
  constructor(
    readonly id: string,
    readonly invitee: string,
    readonly hash: string,
    readonly createdAt: string
  ) {}
  
  get GSI1PK() {
    return `INVITATION#${this.invitee}`
  }

  get GSI1SK() {
    return `INVITATION#${this.id}`
  }

  get keys() {
    return {
      PK: `INVITATION#${this.id}`,
      SK: `INVITATION#${this.id}`
    }
  }

  static async getInvitationByEmail(email: string) {
    return dynamodb.query({
      TableName: process.env.GLOBAL_TABLE as string,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk and begins_with(GSI1SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `INVITATION#${email}`,
        ":sk": `INVITATION#`,
      },
      Limit: 1,
    }).promise()
  }

  static async getInvitationById(id: string) {
    return dynamodb.query({
      TableName: process.env.GLOBAL_TABLE as string,
      KeyConditionExpression: "PK = :pk and SK = :sk",
      ExpressionAttributeValues: {
        ":pk": `INVITATION#${id}`,
        ":sk": `INVITATION#${id}`,
      },
      Limit: 1,
    }).promise()
  }

  async delete() {
    return dynamodb.delete({
      TableName: process.env.GLOBAL_TABLE as string,
      Key: this.keys
    }).promise()
  }

  async put() {
    return dynamodb.put({
      TableName: process.env.GLOBAL_TABLE as string,
      Item: {
        PK: `INVITATION#${this.id}`,
        SK: `INVITATION#${this.id}`,
        GSI1PK: `INVITATION#${this.invitee}`,
        GSI1SK: `INVITATION#${this.id}`,
        id: this.id,
        invitee: this.invitee,
        hash: this.hash,
        createdAt: this.createdAt
      }
    }).promise()
  }
}