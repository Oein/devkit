import express from "express";
import session from "express-session";

import { type DeepslatePlugin } from "d#/types";
import type Deepslate from "d#";

import logger from "#/logger";

import { DeepslateAuth } from "./auth";

/**
 * Core system plugin for Deepslate
 * @name Bedrock
 * @version 0.0.1-dev
 * @author <Oein me@oein.kr>
 * @description Initializes json, session, and authentication.
 * @documentation https://github.com/Oein/devkit/tree/main/backend/docs/system-plugin.md
 */
export default class DeepslateSystem implements DeepslatePlugin {
  name = "Bedrock";
  version = "0.0.1-dev";
  author = "<Oein me@oein.kr>";
  description =
    "Core system plugin for Deepslate\nInitializes json, session, and authentication.";

  constructor(public auth: DeepslateAuth) {}

  async init(deepslate: Deepslate) {
    deepslate.server.use(
      express.json({
        limit: deepslate.props.server.maxJSONSize,
      })
    );

    const sk = process.env.SESSION_SECRET;
    if (typeof sk !== "string")
      throw new Error(
        "SESSION_SECRET is not defined in environment variables."
      );
    if (sk.length < 8)
      logger.warn(
        "SESSION_SECRET is too short. It is recommended to be at least 8 characters long."
      );
    deepslate.server.use(
      session({
        secret: sk,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true },
      })
    );

    // Initialize public data access
    const publicData = deepslate.props.server.fs.resolvePath("/public");
    await deepslate.props.server.fs.mkdir(publicData);
    deepslate.server.use("/deepslate/public", express.static(publicData));
  }
}
