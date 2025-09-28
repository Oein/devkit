export enum UserFlags {
  User = 1 << 0,
  Admin = 1 << 1,
}

export const UserFlags_all = Object.values(UserFlags).reduce((a, b) => {
  if (typeof b === "number") return a | (b as UserFlags);

  throw new Error("Invalid UserFlags value");
}, 0);
