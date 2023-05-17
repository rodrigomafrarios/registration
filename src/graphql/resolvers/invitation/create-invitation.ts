import { v4 as uuid } from 'uuid';
import { nanoid } from 'nanoid';
import { AppSyncResolverHandler } from 'aws-lambda';

import { EMAIL_REGEX, invitationEmail, sesClientFactory } from '@utils';
import { Invitation } from '@models';
import { Invitation as InvitationType, MutationCreateInvitationArgs } from '@graphql/appsync';
import { EmailNotValidError } from '@errors';

const ses = sesClientFactory()

export const createInvitation: AppSyncResolverHandler<MutationCreateInvitationArgs, InvitationType> = async (event, ctx) => {
  const isEmailValid = event.arguments.invitation.invitee.match(EMAIL_REGEX)
  if (!isEmailValid) {
    throw new EmailNotValidError()
  }

  const invitation = new Invitation(
    uuid(),
    event.arguments.invitation.invitee,
    nanoid(),
    new Date().toISOString()
  )

  const invitations = await Invitation.getInvitationByEmail(invitation.invitee)
  
  const invitationExists = invitations.Items && invitations.Items?.length > 0
  if (invitationExists) {
    const invitationToDelete = new Invitation(
      invitations.Items![0].id,
      invitations.Items![0].invitee,
      invitations.Items![0].hash,
      invitations.Items![0].createdAt
    )

    await invitationToDelete.delete()
  }

  await invitation.put()

  await ses.sendEmail(invitationEmail(invitation.hash, [invitation.invitee])).promise()
  
  return {
      __typename: "Invitation",
      ...invitation
  }
};