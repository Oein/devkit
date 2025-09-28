import type { DInitProps, DInitPropsOptional } from "d#/types";

const merge = (target: any, source: any) => {
  for (let key of Object.keys(source)) {
    if (source[key] instanceof Object)
      Object.assign(source[key], merge(target[key], source[key]));
  }

  Object.assign(target || {}, source);
  return target;
};

const deepclone = (obj: any) => {
  return structuredClone(obj);
};

export function mergeProps(
  defaultProps: DInitProps,
  userProps: DInitPropsOptional
): DInitProps {
  const merged = merge(deepclone(defaultProps), userProps) as DInitProps;

  return merged;
}
