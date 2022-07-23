import { createPool } from "mysql2/promise";
import config from "../config/config";

export const connect = async () => {
  const connection = await createPool({
    host: config.DB.HOST,
    user: config.DB.USER,
    password: config.DB.PASSWORD,
    database: config.DB.NAME,
    connectionLimit: 10,
  });
  return connection;
};
