import { v4 as uuid } from 'uuid';
import { nanoid } from 'nanoid';
import { AppSyncResolverHandler } from 'aws-lambda';

import { Invite, MutationCreateInviteArgs } from '../../appsync';
import { sesClientFactory } from '../../../utils/factories/ses-factory';
import { DynamoDBClientFactory } from '../../../utils/factories/db/dynamodb-factory';
import { EMAIL_REGEX } from '../../../utils/email-rule';
import { EmailNotValidError } from '../../../errors';

const dynamodb = DynamoDBClientFactory()
const ses = sesClientFactory()

export const createInvite: AppSyncResolverHandler<MutationCreateInviteArgs, Invite> = async (event, ctx) => {
  const isEmailValid = event.arguments.invite.invitee.match(EMAIL_REGEX)
  if (!isEmailValid) {
    throw new EmailNotValidError()
  }

  const id = uuid()
  const hash = nanoid()
  const item = {
      id,
      invitee: event.arguments.invite.invitee,
      hash,
      createdAt: new Date().toISOString()
  }

  await dynamodb.put({
      TableName: process.env.GLOBAL_TABLE as string,
      Item: {
          PK: `INVITE#${id}`,
          SK: `INVITE#${event.arguments.invite.invitee}`,
          ...item
      }
  }).promise()

  await ses.sendEmail({
    Source: process.env.EMAIL_SENDER as string,
    Destination: {
      ToAddresses: [event.arguments.invite.invitee]
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: `Invitation ${hash} has been sent.`
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Invitation.`
      }
    }
  }).promise()
  
  return {
      __typename: "Invite",
      ...item
  }
};