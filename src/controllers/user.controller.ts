import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Pool } from "mysql2";
import config from "../config/config";
import { connect } from "../db/mysql.connection";
import { generateToken, hashPassword } from "../helpers/authentication.helper";
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
        return res
          .status(400)
          .send({ error: true, data: "No refreshToken was provided." });
      }
      if (!refreshTokens.includes(req.body.refreshToken)) {
        return res
          .status(400)
          .send({ error: true, data: "Refresh token invalid." });
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
          message: "User created successfully.",
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
}
