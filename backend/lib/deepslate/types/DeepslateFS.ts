export interface DeepslateFS {
  resolvePath(rpath: string): string;
  write(path: string, data: string | Buffer): Promise<void>;
  // If file not found, return null
  read(path: string): Promise<string | Buffer | null>;
  // If file not found, throw error
  delete(path: string): Promise<void>;
  // Check if file or directory exists
  exists(path: string): Promise<boolean>;

  // Create directory, including parent directories if not exist
  mkdir(path: string): Promise<void>;
  // Read directory contents, if directory not found, throw error
  readdir(path: string): Promise<string[]>;
  // Remove directory, including all contents
  rmdir(path: string): Promise<void>;
}
