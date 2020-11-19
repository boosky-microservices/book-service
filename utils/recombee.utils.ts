/**
 * Split the auth0 user to use in recombee
 */
export const prepareAuth0UserId = (userId: string) => userId ? userId.split('|')[1] : '';
