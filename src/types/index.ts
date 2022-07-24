import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from "mysql2";

export interface IReturnData {
  error: boolean;
  data: object;
}

export type MysqlQueryResponse = [
  RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader,
  FieldPacket[]
];

export interface IResultSetHeader {
  fieldCount: number;
  affectedRows: number;
  insertId: number;
  info: string;
  serverStatus: number;
  warningStatus: number;
}
