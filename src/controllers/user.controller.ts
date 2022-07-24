import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";
import { generateToken } from "../helpers/authentication.helper";
import { IPayload } from "../middlewares/auth.middleware";

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
}
