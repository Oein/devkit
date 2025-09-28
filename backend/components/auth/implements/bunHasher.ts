import type IHasher from "../hasher";

export default class BunHasher implements IHasher {
  async hash(password: string): Promise<string> {
    return Bun.password.hash(password);
  }

  async verify(password: string, hashed: string): Promise<boolean> {
    return Bun.password.verify(password, hashed);
  }
}
