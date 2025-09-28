import express from "express";

import { UserFlags, type SessionUserData } from "d#/types";
import type Deepslate from "d#";
import prisma from "#/db";

export enum AuthError {
  NO_ACCOUNT,
  WRONG_PASSWORD,
  NOT_LOGGED_IN,

  ALREADY_EXISTS,
}

/**
# Deepslate Authentication System

This module provides a comprehensive authentication system for Deepslate, including user sign-in, sign-out, sign-up, user data management, personal information updates, password management, and flag management.

@documentation https://github.com/Oein/devkit/tree/main/backend/docs/auth.md
*/
export class DeepslateAuth {
  constructor(public deepslate: Deepslate) {
    this.init();
  }
  private init() {
    const r = express.Router();

    // POST /deepslate/auth/signin
    r.post("/signin", async (req, res) => {
      try {
        const { username, password } = req.body;

        if (!username || !password) {
          return res
            .status(400)
            .json({ success: false, error: "Missing username or password" });
        }

        const result = await this.signin(req, username, password);

        if (result === AuthError.NO_ACCOUNT) {
          return res
            .status(404)
            .json({ success: false, error: "Account not found" });
        }

        if (result === AuthError.WRONG_PASSWORD) {
          return res
            .status(401)
            .json({ success: false, error: "Invalid password" });
        }

        res.json({ success: true });
      } catch (error) {
        console.error("Signin error:", error);
        res
          .status(500)
          .json({ success: false, error: "Internal server error" });
      }
    });

    // POST /deepslate/auth/signout
    r.post("/signout", async (req, res) => {
      try {
        if (!req.session?.user) {
          return res
            .status(401)
            .json({ success: false, error: "Not logged in" });
        }

        await this.signout(req);
        res.json({ success: true });
      } catch (error) {
        console.error("Signout error:", error);
        res
          .status(500)
          .json({ success: false, error: "Internal server error" });
      }
    });

    // POST /deepslate/auth/signup
    r.post("/signup", async (req, res) => {
      try {
        const { username, nickname, password } = req.body;

        if (!username || !nickname || !password) {
          return res
            .status(400)
            .json({ success: false, error: "Missing required fields" });
        }

        const result = await this.signup(req, { username, nickname, password });

        if (result === AuthError.ALREADY_EXISTS) {
          return res
            .status(409)
            .json({
              success: false,
              error: "Username or nickname already exists",
            });
        }

        res.json({ success: true });
      } catch (error) {
        console.error("Signup error:", error);
        res
          .status(500)
          .json({ success: false, error: "Internal server error" });
      }
    });

    // GET /deepslate/auth/user
    r.get("/user", async (req, res) => {
      try {
        const user = this.getUserFromSession(req);

        if (!user) {
          return res.json({ success: false });
        }

        // Get additional user data including profileImage
        const account = await prisma.account.findUnique({
          where: { id: user.id },
          select: { profileImage: true },
        });

        res.json({
          success: true,
          user: {
            username: user.username,
            nickname: user.nickname,
            profileImage: account?.profileImage || null,
          },
        });
      } catch (error) {
        console.error("Get user error:", error);
        res
          .status(500)
          .json({ success: false, error: "Internal server error" });
      }
    });

    // DELETE /deepslate/auth/user
    r.delete("/user", async (req, res) => {
      try {
        const user = this.getUserFromSession(req);

        if (!user) {
          return res
            .status(401)
            .json({ success: false, error: "Not logged in" });
        }

        // Delete the user account
        await prisma.account.delete({
          where: { id: user.id },
        });

        // Sign out the user
        await this.signout(req);

        res.json({ success: true });
      } catch (error) {
        console.error("Delete user error:", error);
        res
          .status(500)
          .json({ success: false, error: "Internal server error" });
      }
    });

    this.deepslate.server.use("/deepslate/auth", r);
  }

  authMiddleware(flags: number | number[]) {
    return (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const requiredFlags = Array.isArray(flags) ? flags : [flags];
      if (requiredFlags.length === 0) return next();
      if (!req.session || !req.session.user)
        return res.status(401).json({ error: "Unauthorized" });
      if (requiredFlags.some((flag) => (req.session!.user!.flags & flag) === 0))
        return res.status(403).json({ error: "Forbidden" });
      next();
    };
  }

  getUserFromSession(req: express.Request) {
    return req.session?.user || null;
  }

  // MARK: - Authentication
  async signin(req: express.Request, username: string, password: string) {
    const acc = await prisma.account.findUnique({
      where: {
        username,
      },
    });
    if (!acc) return AuthError.NO_ACCOUNT;
    const isValid = Bun.password.verify(password, acc.password);
    if (!isValid) return AuthError.WRONG_PASSWORD;
    const {
      password: _,
      profileImage: __,
      createdAt: ___,
      userData: ____,
      ...user
    } = acc;
    req.session!.user = user;
    return user;
  }

  async signout(req: express.Request) {
    return await new Promise<void>((resolve, reject) => {
      req.session!.destroy((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async signup(
    req: express.Request,
    props: {
      username: string;
      nickname: string;
      password: string;
      externalFlags?: number;
    }
  ) {
    const existing = await prisma.account.findFirst({
      where: {
        OR: [{ username: props.username }, { nickname: props.nickname }],
      },
    });
    if (existing) return AuthError.ALREADY_EXISTS;
    const hashedPassword = await Bun.password.hash(props.password);
    const acc = await prisma.account.create({
      data: {
        username: props.username,
        nickname: props.nickname,
        password: hashedPassword,
        flags: (props.externalFlags || 0) | UserFlags.User,
      },
    });
    const {
      password: _,
      profileImage: __,
      createdAt: ___,
      userData: ____,
      ...user
    } = acc;
    req.session!.user = user;
    return user as SessionUserData;
  }

  // MARK: - User data management
  async clearUserData(req: express.Request) {
    if (!req.session?.user) return AuthError.NOT_LOGGED_IN;
    await prisma.account.update({
      where: {
        id: req.session.user.id,
      },
      data: {
        userData: "{}",
      },
    });
  }

  async mergeUserData(
    req: express.Request,
    newData: Record<string, any>,
    replace = false
  ) {
    if (!req.session?.user) return AuthError.NOT_LOGGED_IN;
    const acc = await prisma.account.findUnique({
      where: {
        id: req.session.user.id,
      },
      select: {
        userData: true,
      },
    });
    if (!acc) return AuthError.NO_ACCOUNT;
    const currentData = acc.userData ? JSON.parse(acc.userData) : {};
    const mergedData = replace ? newData : { ...currentData, ...newData };
    await prisma.account.update({
      where: {
        id: req.session.user.id,
      },
      data: {
        userData: JSON.stringify(mergedData),
      },
    });
    return mergedData;
  }

  async getUserData(req: express.Request) {
    if (!req.session?.user) return AuthError.NOT_LOGGED_IN;
    const acc = await prisma.account.findUnique({
      where: {
        id: req.session.user.id,
      },
      select: {
        userData: true,
      },
    });
    if (!acc) return AuthError.NO_ACCOUNT;
    return acc.userData ? JSON.parse(acc.userData) : {};
  }

  // MARK: - Personal information management
  async updateNickname(req: express.Request, nickname: string) {
    if (!req.session?.user) return AuthError.NOT_LOGGED_IN;
    const existing = await prisma.account.findUnique({
      where: {
        nickname,
      },
    });
    if (existing) return AuthError.ALREADY_EXISTS;
    const acc = await prisma.account.update({
      where: {
        id: req.session.user.id,
      },
      data: {
        nickname,
      },
    });
    const {
      password: _,
      profileImage: __,
      createdAt: ___,
      userData: ____,
      ...user
    } = acc;
    req.session!.user = user;
    return user as SessionUserData;
  }

  async updateProfileImage(req: express.Request, imageUrl: string) {
    if (!req.session?.user) return AuthError.NOT_LOGGED_IN;
    const acc = await prisma.account.update({
      where: {
        id: req.session.user.id,
      },
      data: {
        profileImage: imageUrl,
      },
    });
    const {
      password: _,
      profileImage: __,
      createdAt: ___,
      userData: ____,
      ...user
    } = acc;
    req.session!.user = user;
    return user as SessionUserData;
  }

  // MARK: - Password management
  async updatePassword(req: express.Request, current: string, newP: string) {
    if (!req.session?.user) return AuthError.NOT_LOGGED_IN;
    const acc = await prisma.account.findUnique({
      where: {
        id: req.session.user.id,
      },
    });
    if (!acc) return AuthError.NO_ACCOUNT;
    const isValid = Bun.password.verify(current, acc.password);
    if (!isValid) return AuthError.WRONG_PASSWORD;
    const hashedPassword = await Bun.password.hash(newP);
    await prisma.account.update({
      where: {
        id: req.session.user.id,
      },
      data: {
        password: hashedPassword,
      },
    });
    return true;
  }

  async setPassword(req: express.Request, newP: string) {
    if (!req.session?.user) return AuthError.NOT_LOGGED_IN;
    const acc = await prisma.account.findUnique({
      where: {
        id: req.session.user.id,
      },
    });
    if (!acc) return AuthError.NO_ACCOUNT;
    const hashedPassword = await Bun.password.hash(newP);
    await prisma.account.update({
      where: {
        id: req.session.user.id,
      },
      data: {
        password: hashedPassword,
      },
    });
    return true;
  }

  // MARK: - Flag management
  async addFlags(req: express.Request, flags: number | number[]) {
    if (!req.session?.user) return AuthError.NOT_LOGGED_IN;
    const addFlags = Array.isArray(flags) ? flags : [flags];
    const acc = await prisma.account.findUnique({
      where: {
        id: req.session.user.id,
      },
    });
    if (!acc) return AuthError.NO_ACCOUNT;
    const newFlags = addFlags.reduce((a, b) => a | b, acc.flags);
    const updated = await prisma.account.update({
      where: {
        id: req.session.user.id,
      },
      data: {
        flags: newFlags,
      },
    });
    const {
      password: _,
      profileImage: __,
      createdAt: ___,
      userData: ____,
      ...user
    } = updated;
    req.session!.user = user;
    return user as SessionUserData;
  }

  async removeFlags(req: express.Request, flags: number | number[]) {
    if (!req.session?.user) return AuthError.NOT_LOGGED_IN;
    const removeFlags = Array.isArray(flags) ? flags : [flags];
    const acc = await prisma.account.findUnique({
      where: {
        id: req.session.user.id,
      },
    });
    if (!acc) return AuthError.NO_ACCOUNT;
    const newFlags = removeFlags.reduce((a, b) => a & ~b, acc.flags);
    const updated = await prisma.account.update({
      where: {
        id: req.session.user.id,
      },
      data: {
        flags: newFlags,
      },
    });
    const {
      password: _,
      profileImage: __,
      createdAt: ___,
      userData: ____,
      ...user
    } = updated;
    req.session!.user = user;
    return user as SessionUserData;
  }

  async setFlags(req: express.Request, flags: number) {
    if (!req.session?.user) return AuthError.NOT_LOGGED_IN;
    const acc = await prisma.account.findUnique({
      where: {
        id: req.session.user.id,
      },
    });
    if (!acc) return AuthError.NO_ACCOUNT;
    const updated = await prisma.account.update({
      where: {
        id: req.session.user.id,
      },
      data: {
        flags,
      },
    });
    const {
      password: _,
      profileImage: __,
      createdAt: ___,
      userData: ____,
      ...user
    } = updated;
    req.session!.user = user;
    return user as SessionUserData;
  }
}
