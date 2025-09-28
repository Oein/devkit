import express from "express";
import chalk from "chalk";

import logger from "l#";

import type { DeepslatePlugin, DInitProps, DInitPropsOptional } from "d#/types";
import { DInitProps_default } from "d#/static";
import { mergeProps, getVersion } from "#/utils";
import DeepslateSystem from "./plugins/system";

export default class Deepslate {
  private systemPlugin = new DeepslateSystem();
  private plugins: DeepslatePlugin[] = [this.systemPlugin];

  public server: express.Express;
  public props: DInitProps;
  public auth = this.systemPlugin.auth;

  public constructor(props: DInitPropsOptional) {
    this.server = express();
    this.props = mergeProps(DInitProps_default, props);
  }

  public start(port: number = this.props.port) {
    logger.info(`Starting Deepslate (${chalk.bold.gray(getVersion())})...`);

    if (
      this.plugins.length == 0 ||
      this.plugins[0] instanceof DeepslateSystem === false
    ) {
      logger.error("System plugin in not loaded. Asserting Deepslate failed.");
      throw new Error("System plugin is required.");
    }

    for (const plugin of this.plugins) {
      logger.info(
        `Initializing plugin: ${chalk.bold(plugin.name)} (${chalk.gray(
          plugin.version
        )})`
      );
      plugin.init(this);
    }
    logger.success(`Has ${chalk.yellow(this.plugins.length)} plugins loaded.`);

    this.server.listen(port, () => {
      logger.success(
        `Server is running on ${chalk.bold.blue(`http://localhost:${port}`)}`
      );
      logger.info("Press Ctrl+C to stop the server");
    });
  }

  public use(plugin: DeepslatePlugin) {
    this.plugins.push(plugin);
  }
}
