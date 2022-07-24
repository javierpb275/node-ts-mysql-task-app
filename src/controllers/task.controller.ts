import { Request, Response } from "express";
import { connect } from "../db/mysql.connection";
import { validateObjectProperties } from "../helpers/validation.helper";
import { TaskModel } from "../models/task.model";
import { IResultSetHeader, MysqlQueryResponse } from "../types";

export default class TaskController {
  public static async createTask(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { user_id, body } = req;
    const newTask: TaskModel = body;
    const isValid: boolean = validateObjectProperties(newTask, [
      "description",
      "is_done",
    ]);
    if (!isValid) {
      return res.status(400).send({
        error: true,
        data: { message: "Invalid Properties." },
      });
    }
    newTask.user_id = user_id;
    try {
      const conn = await connect();
      await conn.query(`INSERT INTO tasks SET ?`, [newTask]);
      return res.status(201).send({
        error: false,
        data: {
          message: "Task created successfully.",
          task: newTask,
        },
      });
    } catch (err) {
      return res.status(400).send({
        error: true,
        data: { message: "Error creating task.", error: err },
      });
    }
  }
  public static async getTaskById(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { params, user_id } = req;
    try {
      const conn = await connect();
      const response: any[] = await conn.query(
        `SELECT description, is_done FROM tasks WHERE user_id = ? AND task_id = ?`,
        [user_id, params.id]
      );
      const tasks: TaskModel[] = response[0];
      if (!tasks.length) {
        return res
          .status(404)
          .send({ error: true, data: { message: "Task Not Found." } });
      }
      return res.status(200).send({
        error: false,
        data: {
          message: "Task found successfully.",
          task: tasks[0],
        },
      });
    } catch (err) {
      return res.status(500).send({
        error: true,
        data: { message: "Unable to get task.", error: err },
      });
    }
  }
  public static async getTasks(req: Request, res: Response): Promise<Response> {
    const { user_id } = req;
    try {
      const conn = await connect();
      const response: any[] = await conn.query(
        `SELECT description, is_done FROM tasks WHERE user_id = ?`,
        [user_id]
      );
      const tasks: TaskModel[] = response[0];
      let message: string;
      if (!tasks.length) {
        message = "No tasks found.";
      } else {
        message = `Found ${tasks.length} tasks`;
      }
      return res.status(200).send({
        error: false,
        data: {
          message,
          tasks,
        },
      });
    } catch (err) {
      return res.status(500).send({
        error: true,
        data: { message: "Unable to get task.", error: err },
      });
    }
  }
  public static async updateTask(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { body, user_id, params } = req;
    const updatedTask: TaskModel = body;
    const isValid: boolean = validateObjectProperties(updatedTask, [
      "description",
      "is_done",
    ]);
    if (!isValid) {
      return res.status(400).send({
        error: true,
        data: { message: "Invalid Properties." },
      });
    }
    try {
      const conn = await connect();
      await conn.query(`UPDATE tasks set ? WHERE user_id = ? AND task_id = ?`, [
        updatedTask,
        user_id,
        params.id,
      ]);
      return res.status(200).send({
        error: false,
        data: {
          message: "Task updated successfully.",
          task: updatedTask,
        },
      });
    } catch (err) {
      return res.status(400).send({
        error: true,
        data: { message: "Unable to update task.", error: err },
      });
    }
  }
  public static async deleteTask(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { user_id, params } = req;
    try {
      const conn = await connect();
      await conn.query(`DELETE FROM tasks WHERE user_id = ? AND task_id = ?`, [
        user_id,
        params.id,
      ]);
      return res.status(200).send({
        error: false,
        data: {
          message: "Task deleted successfully",
          task: {
            user_id,
            task_id: params.id,
          },
        },
      });
    } catch (err) {
      return res.status(500).send({
        error: true,
        data: { message: "Unable to delete task.", error: err },
      });
    }
  }
}
