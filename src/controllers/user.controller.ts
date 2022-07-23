import { Request, Response } from "express";

let refreshTokens: string[] = [];

export default class UserController {
  public static async refreshToken(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      return res.status(200).send({
        error: false,
        data: {
          message: "Success",
        },
      });
    } catch (err) {
      return res.status(500).send({
        error: true,
        data: { message: "Something went wrong", error: err },
      });
    }
  }
}
