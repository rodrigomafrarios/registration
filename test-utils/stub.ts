import { nanoid } from 'nanoid';

import { sesClientFactory } from '@utils';
import { Invitation } from '@models';
import { faker } from '@faker-js/faker';

const ses = sesClientFactory()

export const invitationMock = (data?: Partial<Invitation>): Invitation => new Invitation(
  data?.id ?? faker.string.uuid(),
  data?.invitee ?? faker.internet.email(),
  data?.hash ?? nanoid(),
  data?.createdAt ?? new Date().toISOString()
)

export const createInvitationStub = async (data?: Partial<Invitation>) => {
  const invitation = invitationMock(data)
  await invitation.put()

  return invitation
}

export const invitationExistsStub = async (id: string) => {
  const results = await Invitation.getInvitationById(id)
  if (results.Items && results.Items?.length > 0) {
    return true
  }

  return false
}

export const invitationSent = async () => {
  const statistics = await ses.getSendStatistics().promise()

  const sent = typeof statistics.SendDataPoints !== undefined
    && statistics.SendDataPoints!.length > 0
    && statistics.SendDataPoints![0].DeliveryAttempts
    && statistics.SendDataPoints![0].DeliveryAttempts > 0

  return sent
}