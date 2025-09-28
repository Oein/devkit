import type { DInitProps } from "d#/types";

export const DInitProps_default: DInitProps = {
  port: 3000,
  user: {
    customFlags: 0,
    jwtData: ["id", "username", "profileImage"],
  },
  server: {
    maxJSONSize: "2mb",
  },
};
