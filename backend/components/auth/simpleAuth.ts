import type { IDatabase } from "../database";
import type IHasher from "./hasher";
import type IAuthJwt from "./jwt";

/**
 * Implements a simple authentication system.
 * Users can be authenticated using a username and password.
 * This class is designed to be extended for more complex authentication mechanisms.
 *
 * Has JWT support to allow for token-based authentication.
 *
 * !depends on database, jwt
 */
export class SimpleAuth {
  private jwt: IAuthJwt;
  private database: IDatabase;
  private hasher: IHasher;

  /**
   *
   * @param jwt The JWT implementation to use for token-based authentication.
   * @param hasher For easy implementation, I recommend using "Bun.password.hash"
   */
  constructor(jwt: IAuthJwt, database: IDatabase, hasher: IHasher) {
    this.jwt = jwt;
    this.database = database;
    this.hasher = hasher;
  }

  /**
   * Signs in a user with the given username and password.
   * @param username The username of the user.
   * @param password The password of the user.
   * @returns True if the sign-in was successful, false otherwise.
   */
  async signIn(username: string, password: string): Promise<boolean> {
    const user = await this.database.namespace("users-accounts").get(username);
    if (user == null) return false;

    const hashedPassword = await this.hasher.verify(password, user.password);
    if (!hashedPassword) return false;

    return true;
  }

  /**
   * Signs up a new user with the given username and password.
   * @param username The username of the new user.
   * @param password The password of the new user.
   * @returns True if the sign-up was successful, false if the user already exists.
   */
  async signUp(
    username: string,
    password: string,
    userData: any = {}
  ): Promise<boolean> {
    const user = await this.database.namespace("users-accounts").get(username);
    if (user != null) return false;

    const hashedPassword = await this.hasher.hash(password);
    await this.database.namespace("users-accounts").set(username, {
      password: hashedPassword,
    });
    await this.database.namespace("users-data").set(username, userData || {});

    return true;
  }

  async removeUser(username: string): Promise<void> {
    await this.database.namespace("users-accounts").delete(username);
    await this.database.namespace("users-data").delete(username);
  }

  async getUserToken(username: string): Promise<string | null> {
    const userData = await this.database.namespace("users-data").get(username);
    if (userData == null) return null;

    return this.jwt.sign(username, userData);
  }

  async verifyUserToken(token: string): Promise<boolean> {
    return this.jwt.verify(token);
  }
}
