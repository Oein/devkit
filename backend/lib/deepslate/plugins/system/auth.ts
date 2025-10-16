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

export type AuthRequestResponse<E, D = null> =
  | {
      success: false;
      data: E;
    }
  | {
      success: true;
      data: D;
    };

/**
# Deepslate Authentication System

This module provides a comprehensive authentication system for Deepslate, including user sign-in, sign-out, sign-up, user data management, personal information updates, password management, and flag management.

@documentation https://github.com/Oein/devkit/tree/main/backend/docs/auth.md
*/
export class DeepslateAuth {
  constructor(public deepslate: Deepslate) {}
  public init() {
    const r = express.Router();

    // POST /deepslate/auth/signin
    r.post("/signin", async (req, res) => {
      try {
        const { username, password } = req.body;

        if (!username || !password) {
          return res
            .status(400)
            .json({
              success: false,
              error: ERROR_MESSAGES.MISSING_USERNAME_PASSWORD,
            });
        }

        const result = await this.signin(req, username, password);

        if (result.success === false && result.data === AuthError.NO_ACCOUNT) {
          return res
            .status(404)
            .json({ success: false, error: ERROR_MESSAGES.ACCOUNT_NOT_FOUND });
        }

        if (
          result.success === false &&
          result.data === AuthError.WRONG_PASSWORD
        ) {
          return res
            .status(401)
            .json({ success: false, error: ERROR_MESSAGES.INVALID_PASSWORD });
        }

        res.json({ success: true });
      } catch (error) {
        console.error("Signin error:", error);
        res
          .status(500)
          .json({
            success: false,
            error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
          });
      }
    });

    // POST /deepslate/auth/signout
    r.post("/signout", async (req, res) => {
      try {
        if (!req.session?.user) {
          return res
            .status(401)
            .json({ success: false, error: ERROR_MESSAGES.NOT_LOGGED_IN });
        }

        await this.signout(req);
        res.json({ success: true });
      } catch (error) {
        console.error("Signout error:", error);
        res
          .status(500)
          .json({
            success: false,
            error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
          });
      }
    });

    // POST /deepslate/auth/signup
    r.post("/signup", async (req, res) => {
      try {
        const { username, nickname, password } = req.body;

        if (!username || !nickname || !password) {
          return res
            .status(400)
            .json({
              success: false,
              error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
            });
        }

        const result = await this.signup(req, { username, nickname, password });

        if (result === AuthError.ALREADY_EXISTS) {
          return res.status(409).json({
            success: false,
            error: ERROR_MESSAGES.USERNAME_ALREADY_EXISTS,
          });
        }

        res.json({ success: true });
      } catch (error) {
        console.error("Signup error:", error);
        res
          .status(500)
          .json({
            success: false,
            error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
          });
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
          select: { profileImage: true, nickname: true, username: true },
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
          .json({
            success: false,
            error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
          });
      }
    });

    // DELETE /deepslate/auth/user
    r.delete("/user", async (req, res) => {
      try {
        const user = this.getUserFromSession(req);

        if (!user) {
          return res
            .status(401)
            .json({ success: false, error: ERROR_MESSAGES.NOT_LOGGED_IN });
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
          .json({
            success: false,
            error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
          });
      }
    });

    // POST /deepslate/auth/profile/upload
    r.post("/profile/upload", async (req, res) => {
      try {
        const user = this.getUserFromSession(req);

        if (!user) {
          return res
            .status(401)
            .json({ success: false, error: ERROR_MESSAGES.NOT_LOGGED_IN });
        }

        if (!req.body || req.body.length === 0) {
          return res
            .status(400)
            .json({ success: false, error: ERROR_MESSAGES.NO_FILE_DATA });
        }

        // Create public/profileImage directory if it doesn't exist
        const publicDir = this.deepslate.props.server.fs.resolvePath("/public");
        const profileImageDir = this.deepslate.props.server.fs.resolvePath(
          "/public/profileImage"
        );

        await this.deepslate.props.server.fs.mkdir(publicDir);
        await this.deepslate.props.server.fs.mkdir(profileImageDir);

        // Save the file
        const filePath = `/public/profileImage/${user.id}.webp`;
        const buffer = Buffer.isBuffer(req.body)
          ? req.body
          : Buffer.from(req.body);
        await this.deepslate.props.server.fs.write(filePath, buffer);

        // Update user's profile image URL in database
        const profileImageUrl = `/deepslate/public/profileImage/${user.id}.webp`;
        await this.updateProfileImage(req, profileImageUrl);

        res.json({
          success: true,
          profileImage: profileImageUrl,
        });
      } catch (error) {
        console.error("Profile upload error:", error);
        res
          .status(500)
          .json({
            success: false,
            error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
          });
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
  async signin(
    req: express.Request,
    username: string,
    password: string
  ): Promise<
    AuthRequestResponse<
      AuthError.NO_ACCOUNT | AuthError.WRONG_PASSWORD,
      SessionUserData
    >
  > {
    const acc = await prisma.account.findUnique({
      where: {
        username,
      },
    });
    if (!acc) return { success: false, data: AuthError.NO_ACCOUNT };
    const isValid = await Bun.password.verify(password, acc.password);
    if (!isValid) return { success: false, data: AuthError.WRONG_PASSWORD };
    const {
      password: _,
      profileImage: __,
      createdAt: ___,
      userData: ____,
      ...user
    } = acc;
    req.session!.user = user;
    return { success: true, data: user };
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
        OR: [{ username: props.username }],
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
  ): Promise<
    AuthRequestResponse<
      AuthError.NOT_LOGGED_IN | AuthError.NO_ACCOUNT,
      Record<string, any>
    >
  > {
    if (!req.session?.user)
      return { success: false, data: AuthError.NOT_LOGGED_IN };
    const acc = await prisma.account.findUnique({
      where: {
        id: req.session.user.id,
      },
      select: {
        userData: true,
      },
    });
    if (!acc) return { success: false, data: AuthError.NO_ACCOUNT };
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
    return { success: true, data: mergedData };
  }

  async getUserData(
    req: express.Request
  ): Promise<
    AuthRequestResponse<
      AuthError.NOT_LOGGED_IN | AuthError.NO_ACCOUNT,
      Record<string, any>
    >
  > {
    if (!req.session?.user)
      return { success: false, data: AuthError.NOT_LOGGED_IN };
    const acc = await prisma.account.findUnique({
      where: {
        id: req.session.user.id,
      },
      select: {
        userData: true,
      },
    });
    if (!acc) return { success: false, data: AuthError.NO_ACCOUNT };
    return {
      success: true,
      data: acc.userData ? JSON.parse(acc.userData) : {},
    };
  }

  // MARK: - Personal information management
  async updateNickname(
    req: express.Request,
    nickname: string
  ): Promise<
    AuthRequestResponse<
      AuthError.NOT_LOGGED_IN | AuthError.ALREADY_EXISTS,
      SessionUserData
    >
  > {
    if (!req.session?.user)
      return { success: false, data: AuthError.NOT_LOGGED_IN };
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
    return {
      success: true,
      data: user as SessionUserData,
    };
  }

  async updateProfileImage(
    req: express.Request,
    imageUrl: string
  ): Promise<AuthRequestResponse<AuthError.NOT_LOGGED_IN, SessionUserData>> {
    if (!req.session?.user)
      return { success: false, data: AuthError.NOT_LOGGED_IN };
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
    return {
      success: true,
      data: user as SessionUserData,
    };
  }

  // MARK: - Password management
  async updatePassword(
    req: express.Request,
    current: string,
    newP: string
  ): Promise<
    AuthRequestResponse<
      AuthError.NOT_LOGGED_IN | AuthError.NO_ACCOUNT | AuthError.WRONG_PASSWORD,
      null
    >
  > {
    if (!req.session?.user)
      return { success: false, data: AuthError.NOT_LOGGED_IN };
    const acc = await prisma.account.findUnique({
      where: {
        id: req.session.user.id,
      },
    });
    if (!acc) return { success: false, data: AuthError.NO_ACCOUNT };
    const isValid = await Bun.password.verify(current, acc.password);
    if (!isValid) return { success: false, data: AuthError.WRONG_PASSWORD };
    const hashedPassword = await Bun.password.hash(newP);
    await prisma.account.update({
      where: {
        id: req.session.user.id,
      },
      data: {
        password: hashedPassword,
      },
    });
    return { success: true, data: null };
  }

  async setPassword(
    req: express.Request,
    newP: string
  ): Promise<
    AuthRequestResponse<AuthError.NOT_LOGGED_IN | AuthError.NO_ACCOUNT, null>
  > {
    if (!req.session?.user)
      return { success: false, data: AuthError.NOT_LOGGED_IN };
    const acc = await prisma.account.findUnique({
      where: {
        id: req.session.user.id,
      },
    });
    if (!acc) return { success: false, data: AuthError.NO_ACCOUNT };
    const hashedPassword = await Bun.password.hash(newP);
    await prisma.account.update({
      where: {
        id: req.session.user.id,
      },
      data: {
        password: hashedPassword,
      },
    });
    return { success: true, data: null };
  }

  // MARK: - Flag management
  async addFlags(
    req: express.Request,
    flags: number | number[]
  ): Promise<
    AuthRequestResponse<
      AuthError.NOT_LOGGED_IN | AuthError.NO_ACCOUNT,
      SessionUserData
    >
  > {
    if (!req.session?.user)
      return { success: false, data: AuthError.NOT_LOGGED_IN };
    const addFlags = Array.isArray(flags) ? flags : [flags];
    const acc = await prisma.account.findUnique({
      where: {
        id: req.session.user.id,
      },
    });
    if (!acc) return { success: false, data: AuthError.NO_ACCOUNT };
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
    return {
      success: true,
      data: user as SessionUserData,
    };
  }

  async removeFlags(
    req: express.Request,
    flags: number | number[]
  ): Promise<
    AuthRequestResponse<
      AuthError.NOT_LOGGED_IN | AuthError.NO_ACCOUNT,
      SessionUserData
    >
  > {
    if (!req.session?.user)
      return { success: false, data: AuthError.NOT_LOGGED_IN };
    const removeFlags = Array.isArray(flags) ? flags : [flags];
    const acc = await prisma.account.findUnique({
      where: {
        id: req.session.user.id,
      },
    });
    if (!acc) return { success: false, data: AuthError.NO_ACCOUNT };
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
    return {
      success: true,
      data: user as SessionUserData,
    };
  }

  async setFlags(
    req: express.Request,
    flags: number
  ): Promise<
    AuthRequestResponse<
      AuthError.NOT_LOGGED_IN | AuthError.NO_ACCOUNT,
      SessionUserData
    >
  > {
    if (!req.session?.user)
      return { success: false, data: AuthError.NOT_LOGGED_IN };
    const acc = await prisma.account.findUnique({
      where: {
        id: req.session.user.id,
      },
    });
    if (!acc) return { success: false, data: AuthError.NO_ACCOUNT };
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
    return {
      success: true,
      data: user as SessionUserData,
    };
  }
}

// Updated error messages to be in Korean
const ERROR_MESSAGES = {
  MISSING_USERNAME_PASSWORD: "사용자 이름 또는 비밀번호가 누락되었습니다.",
  ACCOUNT_NOT_FOUND: "계정을 찾을 수 없습니다.",
  INVALID_PASSWORD: "비밀번호가 올바르지 않습니다.",
  INTERNAL_SERVER_ERROR: "내부 서버 오류가 발생했습니다.",
  NOT_LOGGED_IN: "로그인되어 있지 않습니다.",
  MISSING_REQUIRED_FIELDS: "필수 입력란이 누락되었습니다.",
  USERNAME_ALREADY_EXISTS: "사용자 이름이 이미 존재합니다.",
  UNAUTHORIZED: "권한이 없습니다.",
  FORBIDDEN: "접근이 금지되었습니다.",
  NO_FILE_DATA: "파일 데이터가 제공되지 않았습니다.",
};
