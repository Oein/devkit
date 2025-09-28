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
 */
export default class DeepslateSystem implements DeepslatePlugin {
  name = "Bedrock";
  version = "0.0.1-dev";
  author = "<Oein me@oein.kr>";
  description =
    "Core system plugin for Deepslate\nInitializes json, session, and authentication.";

  auth!: DeepslateAuth;

  init(deepslate: Deepslate) {
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

    this.auth = new DeepslateAuth(deepslate);
  }
}
