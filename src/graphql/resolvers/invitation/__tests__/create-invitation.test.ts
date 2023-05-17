import { gql } from 'apollo-boost';

import { createInvitationStub, invitationExistsStub, invitationSent } from '@stub';

const CREATE_INVITATION_GQL = gql`
mutation($invitation: InvitationInput!) {
  createInvitation(invitation: $invitation) {
      ... on Invitation {
        id,
        invitee,
        hash,
        createdAt
      }
  }
}
`

describe("createInvitation - Mutation", () => {
  it("should throw if email is not valid", async () => {
    await expect(global.apolloClient.mutate({
      mutation: CREATE_INVITATION_GQL,
      variables: {
        invitation: {
          invitee: "abc"
        }
      }
    })).rejects.toMatchInlineSnapshot(`[Error: GraphQL error: E-mail not valid]`)
  })

  it("should remove an existitent invite for invitee", async () => {

    // given
    const { id, invitee } = await createInvitationStub({
      invitee: "rodrigomafrarios@gmail.com"
    })

    // when
    await global.apolloClient.mutate({
      mutation: CREATE_INVITATION_GQL,
      variables: {
        invitation: {
          invitee
        }
      }
    })

    // then
    const exits = await invitationExistsStub(id!)

    expect(exits).toBeFalsy()
    
  })

  it("should create an invite", async () => {
    await expect(global.apolloClient.mutate({
      mutation: CREATE_INVITATION_GQL,
      variables: {
        invitation: {
          invitee: "rodrigomafrarios@gmail.com"
        }
      }
    })).resolves.toMatchInlineSnapshot(`
    {
      "data": {
        "createInvitation": {
          "__typename": "Invitation",
          "createdAt": "2022-01-03T17:00:00.000Z",
          "hash": "000000000000000000000",
          "id": "00000000-0000-3333-5555-000000000000",
          "invitee": "rodrigomafrarios@gmail.com",
        },
      },
    }
    `)

    const sent = await invitationSent()
    
    expect(sent).toBeTruthy()

  })
})