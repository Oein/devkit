import type { SessionUserData } from "./JWTUserData";

export * from "./DInitProps";
export * from "./UserFlags";
export * from "./JWTUserData";
export * from "./DeepslatePlugin";
export * from "./DeepslateFS";

declare module "express-session" {
  interface SessionData {
    user: SessionUserData;
  }
}
