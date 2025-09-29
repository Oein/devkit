import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import type { DeepslateFS } from "d#/types";

/**
 * @version 1.0.0
 * @author <Oein me@oein.kr>
 * @description Local filesystem storage plugin for Deepslate.
 */
export class DeepslateFS_Local implements DeepslateFS {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;

    if (!fsSync.existsSync(this.basePath)) {
      fsSync.mkdirSync(this.basePath, { recursive: true });
    }
  }

  public resolvePath(rpath: string): string {
    // check if rpath is safe
    if (
      rpath.includes("/../") ||
      rpath.startsWith("../") ||
      rpath.endsWith("/..")
    ) {
      throw new Error("Path traversal detected");
    }
    return path.join(this.basePath, rpath);
  }

  public async write(rpath: string, data: string | Buffer): Promise<void> {
    const fullPath = this.resolvePath(rpath);
    await fs.writeFile(fullPath, data);
  }

  public async read(rpath: string): Promise<string | Buffer | null> {
    const fullPath = this.resolvePath(rpath);
    try {
      return await fs.readFile(fullPath);
    } catch (e: any) {
      if (e.code === "ENOENT") {
        return null;
      }
      throw e;
    }
  }

  public async delete(rpath: string): Promise<void> {
    const fullPath = this.resolvePath(rpath);
    await fs.unlink(fullPath);
  }

  public async exists(rpath: string): Promise<boolean> {
    const fullPath = this.resolvePath(rpath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  public async mkdir(rpath: string): Promise<void> {
    const fullPath = this.resolvePath(rpath);
    await fs.mkdir(fullPath, { recursive: true });
  }

  public async readdir(rpath: string): Promise<string[]> {
    const fullPath = this.resolvePath(rpath);
    return await fs.readdir(fullPath);
  }

  public async rmdir(rpath: string): Promise<void> {
    const fullPath = this.resolvePath(rpath);
    await fs.rmdir(fullPath, { recursive: true });
  }
}
