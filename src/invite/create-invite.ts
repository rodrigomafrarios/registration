import { AppSyncResolverHandler } from 'aws-lambda';

import { Invite, MutationCreateInviteArgs } from '../../appsync';

export const handler: AppSyncResolverHandler<MutationCreateInviteArgs, Invite> = async (event): Promise<any> => {
    console.log("ahoy")
};