export const invitationEmail = (hash: string, invitees: string[]) => {
  return {
    Source: process.env.EMAIL_SENDER as string,
    Destination: {
      ToAddresses: invitees
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
  }
}
