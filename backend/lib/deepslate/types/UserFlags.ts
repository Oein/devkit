export enum UserFlags {
  User = 1 << 0,
  Admin = 1 << 1,
}

export const UserFlags_all = UserFlags.User | UserFlags.Admin;
