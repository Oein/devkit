export default interface IAuthJwt {
  /**
   * Signs a user with the given userID and userData to create a JWT token.
   * The auth class will give the entire user data to the JWT implementation.
   * So you should select what data you want to include in the token.
   */
  sign(userID: string, userData: any): Promise<string>;
  verify(token: string): Promise<boolean>;
}
