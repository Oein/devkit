import type { Account } from "#/generated/prisma";

export type AvaliableUserDataKeys = keyof Omit<Account, "password">;
export type SelectedUserData = AvaliableUserDataKeys[];
export type SessionUserData = Omit<
  Account,
  "password" | "profileImage" | "createdAt" | "userData"
>;
