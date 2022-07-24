import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";
import { connect } from "../db/mysql.connection";
import {
  comparePassword,
  generateToken,
  hashPassword,
} from "../helpers/authentication.helper";
import {
  isCorrectEmail,
  isSecurePassword,
  validateObjectProperties,
} from "../helpers/validation.helper";
import { IPayload } from "../middlewares/auth.middleware";
import { UserModel } from "../models/user.model";
import { IResultSetHeader, MysqlQueryResponse } from "../types";

let refreshTokens: string[] = [];

export default class UserController {
  public static async refreshToken(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      if (!req.body.refreshToken) {
        return res.status(400).send({
          error: true,
          data: { message: "No refreshToken was provided." },
        });
      }
      if (!refreshTokens.includes(req.body.refreshToken)) {
        return res
          .status(400)
          .send({ error: true, data: { message: "Refresh token invalid." } });
      }
      refreshTokens = refreshTokens.filter(
        (reToken) => reToken != req.body.refreshToken
      );
      const payload = jwt.decode(req.body.refreshToken) as IPayload;
      const accessToken: string = generateToken(
        payload.id,
        config.AUTH.ACCESS_TOKEN_SECRET,
        config.AUTH.ACCESS_TOKEN_EXPIRATION
      );
      const refreshToken: string = generateToken(
        payload.id,
        config.AUTH.REFRESH_TOKEN_SECRET,
        config.AUTH.REFRESH_TOKEN_EXPIRATION
      );
      refreshTokens.push(refreshToken);
      return res.status(200).send({
        error: false,
        data: {
          message: "Refreshed token successfully.",
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      return res.status(500).send({
        error: true,
        data: { message: "Unable to refresh token", error: err },
      });
    }
  }
  public static async signUp(req: Request, res: Response): Promise<Response> {
    const newUser: UserModel = req.body;
    const isValid: boolean = validateObjectProperties(newUser, [
      "username",
      "email",
      "password",
    ]);
    if (!isValid) {
      return res.status(400).send({
        error: true,
        data: { message: "Invalid Properties." },
      });
    }
    if (!newUser.username) {
      return res.status(400).send({
        error: true,
        data: { message: "Please, provide a username." },
      });
    }
    if (!newUser.email) {
      return res.status(400).send({
        error: true,
        data: { message: "Please, provide an email." },
      });
    }
    if (!newUser.password) {
      return res.status(400).send({
        error: true,
        data: { message: "Please, provide a password." },
      });
    }
    if (!isCorrectEmail(newUser.email)) {
      return res.status(400).send({
        error: true,
        data: { message: `${newUser.email} is not an email.` },
      });
    }
    if (!isSecurePassword(newUser.password)) {
      return res.status(400).send({
        error: true,
        data: {
          message:
            "Passwords must have at least 6 characters, one lowercase letter, one uppercase letter and one number",
        },
      });
    }
    try {
      const hash: string = await hashPassword(newUser.password);
      newUser.password = hash;
      const conn = await connect();
      const response: MysqlQueryResponse = await conn.query(
        `INSERT INTO users SET ?`,
        [newUser]
      );
      const resultSetHeader = response[0] as IResultSetHeader;
      const accessToken: string = generateToken(
        resultSetHeader.insertId,
        config.AUTH.ACCESS_TOKEN_SECRET,
        config.AUTH.ACCESS_TOKEN_EXPIRATION
      );
      const refreshToken: string = generateToken(
        resultSetHeader.insertId,
        config.AUTH.REFRESH_TOKEN_SECRET,
        config.AUTH.REFRESH_TOKEN_EXPIRATION
      );
      refreshTokens.push(refreshToken);
      return res.status(201).send({
        error: false,
        data: {
          message: "Signed up successfully.",
          user: {
            username: newUser.username,
            email: newUser.email,
            user_id: resultSetHeader.insertId,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      return res.status(400).send({
        error: true,
        data: { message: "Error creating user.", error: err },
      });
    }
  }
  public static async signIn(req: Request, res: Response): Promise<Response> {
    const user: UserModel = req.body;
    if (!user.email) {
      return res
        .status(400)
        .send({ error: true, data: { message: "Please, provide an email." } });
    }
    if (!user.password) {
      return res.status(400).send({
        error: true,
        data: { message: "Please, provide a password." },
      });
    }
    try {
      const conn = await connect();
      const response: any[] = await conn.query(
        `SELECT * FROM users WHERE email = ?`,
        [user.email]
      );
      const users: UserModel[] = response[0];
      if (!users.length) {
        return res
          .status(404)
          .send({ error: true, data: { message: "Wrong credentials." } });
      }
      const isMatch: boolean = await comparePassword(
        user.password,
        users[0].password!
      );
      if (!isMatch) {
        return res
          .status(400)
          .send({ error: true, data: { message: "Wrong credentials." } });
      }
      const accessToken: string = generateToken(
        users[0].user_id,
        config.AUTH.ACCESS_TOKEN_SECRET,
        config.AUTH.ACCESS_TOKEN_EXPIRATION
      );
      const refreshToken: string = generateToken(
        users[0].user_id,
        config.AUTH.REFRESH_TOKEN_SECRET,
        config.AUTH.REFRESH_TOKEN_EXPIRATION
      );
      refreshTokens.push(refreshToken);
      return res.status(200).send({
        error: false,
        data: {
          message: "Signed in successfully.",
          user: {
            user_id: users[0].user_id,
            username: users[0].username,
            email: users[0].email,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      return res.status(400).send({
        error: true,
        data: { message: "Unable to sign in.", error: err },
      });
    }
  }
  public static async signOut(req: Request, res: Response): Promise<Response> {
    if (!req.body.refreshToken) {
      return res.status(400).send({
        error: true,
        data: { message: "No refreshToken was provided." },
      });
    }
    if (!refreshTokens.includes(req.body.refreshToken)) {
      return res
        .status(400)
        .send({ error: true, data: { message: "Refresh Token Invalid." } });
    }
    try {
      refreshTokens = refreshTokens.filter(
        (reToken) => reToken != req.body.refreshToken
      );
      return res
        .status(200)
        .send({ error: false, data: { message: "Signed out successfully." } });
    } catch (err) {
      return res.status(500).send({
        error: true,
        data: { message: "Unable to sign out.", error: err },
      });
    }
  }
  public static async getProfile(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { user_id } = req;
    try {
      const conn = await connect();
      const response: any[] = await conn.query(
        `SELECT user_id, email, username FROM users WHERE user_id = ?`,
        [user_id]
      );
      const users: UserModel[] = response[0];
      if (!users.length) {
        return res
          .status(404)
          .send({ error: true, data: { message: "User Not Found." } });
      }
      return res.status(200).send({
        error: false,
        data: {
          message: "Profile obtained successfully.",
          user: users[0],
        },
      });
    } catch (err) {
      return res.status(500).send({
        error: true,
        data: { message: "Unable to get profile.", error: err },
      });
    }
  }
  public static async updateProfile(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { body, user_id } = req;
    const updatedUser: UserModel = body;
    const isValid: boolean = validateObjectProperties(updatedUser, [
      "username",
      "email",
      "password",
    ]);
    if (!isValid) {
      return res.status(400).send({
        error: true,
        data: { message: "Invalid Properties." },
      });
    }
    try {
      const conn = await connect();
      if (updatedUser.password) {
        const hash: string = await hashPassword(updatedUser.password);
        updatedUser.password = hash;
      }
      await conn.query(`UPDATE users set ? WHERE user_id = ?`, [
        updatedUser,
        user_id,
      ]);
      delete updatedUser.password;
      return res.status(200).send({
        error: false,
        data: {
          message: "Profile updated successfully.",
          user: updatedUser,
        },
      });
    } catch (err) {
      return res.status(400).send({
        error: true,
        data: { message: "Unable to update profile.", error: err },
      });
    }
  }
  public static async deleteProfile(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { user_id } = req;
    if (!req.body.refreshToken) {
      return res.status(400).send({
        error: true,
        data: { message: "No refreshToken was provided." },
      });
    }
    if (!refreshTokens.includes(req.body.refreshToken)) {
      return res
        .status(400)
        .send({ error: true, data: { message: "Refresh token invalid." } });
    }
    try {
      const conn = await connect();
      await conn.query(`DELETE FROM users WHERE user_id = ?`, [user_id]);
      refreshTokens = refreshTokens.filter(
        (reToken) => reToken != req.body.refreshToken
      );
      return res.status(200).send({
        error: false,
        data: {
          message: "Profile deleted successfully",
          user: {
            user_id,
          },
        },
      });
    } catch (err) {
      return res.status(500).send({
        error: true,
        data: { message: "Unable to delete profile.", error: err },
      });
    }
  }
}
