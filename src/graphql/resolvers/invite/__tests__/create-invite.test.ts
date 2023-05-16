import { gql } from 'apollo-boost';

import { sesClientFactory } from '../../../../utils/factories/ses-factory';

const CREATE_INVITE_GQL = gql`
mutation($invite: InviteInput!) {
  createInvite(invite: $invite) {
      ... on Invite {
        id,
        invitee,
        hash,
        createdAt
      }
  }
}
`

const ses = sesClientFactory()

describe("createInvite - Mutation", () => {
  it("should throw if email is not valid", async () => {
    await expect(global.apolloClient.mutate({
      mutation: CREATE_INVITE_GQL,
      variables: {
        invite: {
          invitee: "abc"
        }
      }
    })).rejects.toMatchInlineSnapshot(`[Error: GraphQL error: E-mail not valid]`)
  })

  it("should create an invite", async () => {
    await expect(global.apolloClient.mutate({
      mutation: CREATE_INVITE_GQL,
      variables: {
        invite: {
          invitee: "rodrigomafrarios@gmail.com"
        }
      }
    })).resolves.toMatchInlineSnapshot(`
    {
      "data": {
        "createInvite": {
          "__typename": "Invite",
          "createdAt": "2022-01-03T17:00:00.000Z",
          "hash": "000000000000000000000",
          "id": "00000000-0000-3333-5555-000000000000",
          "invitee": "rodrigomafrarios@gmail.com",
        },
      },
    }
    `)

    const statistics = await ses.getSendStatistics().promise()
    
    expect(statistics.SendDataPoints![0].DeliveryAttempts).toBeGreaterThan(0)

  })
})