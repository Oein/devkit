import type { Account } from "#/generated/prisma";
import type { SessionUserData } from "./JWTUserData";

export * from "./DInitProps";
export * from "./UserFlags";
export * from "./JWTUserData";
export * from "./DeepslatePlugin";

declare module "express-session" {
  interface SessionData {
    user: SessionUserData;
  }
}
