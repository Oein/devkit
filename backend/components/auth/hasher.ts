export default interface IHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hashed: string): Promise<boolean>;
}
