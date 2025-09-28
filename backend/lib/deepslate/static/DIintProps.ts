import { type DInitProps, type DeepslateFS } from "d#/types";

class ErrorThrowingFS implements DeepslateFS {
  constructor() {}
  errorThrower() {
    throw new Error("Set a valid DeepslateFS in DInitProps.server.fs");
  }
  async delete(path: string): Promise<void> {
    this.errorThrower();
  }
  async exists(path: string): Promise<boolean> {
    this.errorThrower();
    return false;
  }
  async mkdir(path: string): Promise<void> {
    this.errorThrower();
  }
  async read(path: string): Promise<string | Buffer | null> {
    this.errorThrower();
    return null;
  }
  async readdir(path: string): Promise<string[]> {
    this.errorThrower();
    return [];
  }
  resolvePath(rpath: string): string {
    this.errorThrower();
    return "";
  }
  async rmdir(path: string): Promise<void> {
    this.errorThrower();
  }
  async write(path: string, data: string | Buffer): Promise<void> {
    this.errorThrower();
  }
}

export const DInitProps_default: DInitProps = {
  port: 3000,
  user: {
    customFlags: 0,
    jwtData: ["id", "username", "profileImage"],
  },
  server: {
    maxJSONSize: "2mb",
    fs: new ErrorThrowingFS(),
  },
};
