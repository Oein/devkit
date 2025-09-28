import type Deepslate from "..";

export interface DeepslatePlugin {
  name: string;

  version: string;
  author?: string;
  description?: string;

  init: (deepslate: Deepslate) => void | Promise<void>;
}
