import type { DeepslateFS } from "./DeepslateFS";
import type { SelectedUserData } from "./JWTUserData";

export type DInitProps = {
  port: number;
  user: {
    customFlags: number;
    jwtData: SelectedUserData;
  };
  server: {
    maxJSONSize: string | number;
    fs: DeepslateFS;
  };
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type DInitPropsOptional = DeepPartial<DInitProps>;
