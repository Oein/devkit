import type { DInitProps, DInitPropsOptional } from "d#/types";

export function mergeProps(
  defaultProps: DInitProps,
  userProps: DInitPropsOptional
): DInitProps {
  const merged: DInitProps = { ...defaultProps };

  for (const key in userProps) {
    if ((userProps as any)[key] !== undefined) {
      if (
        typeof (userProps as any)[key] === "object" &&
        !Array.isArray((userProps as any)[key]) &&
        (userProps as any)[key] !== null
      ) {
        (merged as any)[key] = mergeProps(
          (defaultProps as any)[key] as DInitProps,
          (userProps as any)[key] as DInitPropsOptional
        ) as any;
      } else {
        (merged as any)[key] = (userProps as any)[key] as any;
      }
    }
  }

  return merged;
}
