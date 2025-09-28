export function getVersion() {
  const envVersion = process.env.DEEPSLATE_VERSION;
  if (envVersion) return envVersion;
  const pkgVersion = require("../../package.json").version;
  if (pkgVersion) return pkgVersion + "-dev";
  return "N/A-dev";
}
