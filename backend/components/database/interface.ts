/**
 * In every function, they must ensure that the connection is established and the namespace exists.
 * If the namespace does not exist, it should create it.
 */
export interface IDatabaseNamespace {
  database: IDatabase;
  namespace: string;

  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  has(key: string): Promise<boolean>;
}

export interface IDatabase {
  /**
   * Ensures that the database connection is established.
   * @returns {Promise<boolean>} A promise that resolves to true if the connection is established, false otherwise.
   * @throws {Error} If there is an error while ensuring the connection.
   */
  ensureConnection(): Promise<boolean>;

  /**
   * Ensures that the namespace exists in the database and creates it if it does not.
   * @param namespace The namespace to use for the database operations.
   * @returns {IDatabaseNamespace} An instance of IDatabaseNamespace for the specified namespace
   */
  namespace(namespace: string): IDatabaseNamespace;
}
