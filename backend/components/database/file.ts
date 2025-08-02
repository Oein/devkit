import type { IDatabase, IDatabaseNamespace } from "./interface";
import fs from "fs/promises";

export class JSONDatabaseNamespace implements IDatabaseNamespace {
  database: JSONDatabase;
  namespace: string;

  constructor(database: JSONDatabase, namespace: string) {
    this.database = database;
    this.namespace = namespace;
  }

  async ensureNamespace(): Promise<void> {
    if (!(this.namespace in this.database._data)) {
      this.database._data[this.namespace] = {};
    }

    if (this.database._config.saveOnAction !== false)
      await this.database.save();

    return void 0;
  }

  async get<T = any>(key: string): Promise<T | null> {
    const connection = await this.database.ensureConnection();
    if (!connection) return null;
    await this.ensureNamespace();

    return this.database._data[this.namespace]![key] || null;
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    const connection = await this.database.ensureConnection();
    if (!connection) return;

    await this.ensureNamespace();
    this.database._data[this.namespace]![key] = value;

    if (this.database._config.saveOnAction !== false)
      await this.database.save();
  }

  async delete(key: string): Promise<void> {
    const connection = await this.database.ensureConnection();
    if (!connection) return;

    await this.ensureNamespace();
    delete this.database._data[this.namespace]![key];

    if (this.database._config.saveOnAction !== false)
      await this.database.save();
  }

  async clear(): Promise<void> {
    const connection = await this.database.ensureConnection();
    if (!connection) return;

    await this.ensureNamespace();
    delete this.database._data[this.namespace];

    if (this.database._config.saveOnAction !== false)
      await this.database.save();
  }

  async keys(): Promise<string[]> {
    const connection = await this.database.ensureConnection();
    if (!connection) return [];

    await this.ensureNamespace();
    return Object.keys(this.database._data[this.namespace] || {});
  }

  async has(key: string): Promise<boolean> {
    const connection = await this.database.ensureConnection();
    if (!connection) return false;

    await this.ensureNamespace();
    return key in this.database._data[this.namespace]!;
  }
}

export interface IJSONDatabaseConfig {
  // true
  saveOnAction?: boolean;
  // false
  formatOnSave?: boolean;
  // true
  createIfNotExists?: boolean;
}

export default class JSONDatabase implements IDatabase {
  public _data: { [key: string]: { [key: string]: any } } = {};
  public _filepath: string;
  public _fileLoaded: boolean = false;
  public _config: IJSONDatabaseConfig;

  constructor(filepath: string, config: IJSONDatabaseConfig = {}) {
    this._filepath = filepath;
    this._config = config;
    this._data = {};
    this._fileLoaded = false;
  }

  async ensureConnection(): Promise<boolean> {
    if (this._fileLoaded) return true;

    if (this._config.createIfNotExists !== false) {
      try {
        await fs.access(this._filepath);
      } catch {
        await fs.writeFile(this._filepath, JSON.stringify({}));
      }
    }

    try {
      const fileContent = await fs.readFile(this._filepath, "utf-8");
      this._data = JSON.parse(fileContent);
      this._fileLoaded = true;
      return true;
    } catch (error) {
      console.error("Error loading database file:", error);
      return false;
    }
  }

  namespace(namespace: string): IDatabaseNamespace {
    return new JSONDatabaseNamespace(this, namespace);
  }

  async save(): Promise<void> {
    if (this._config.formatOnSave)
      await fs.writeFile(this._filepath, JSON.stringify(this._data, null, 2));
    else await fs.writeFile(this._filepath, JSON.stringify(this._data));
  }
}
