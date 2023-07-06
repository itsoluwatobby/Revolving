import { Schema, model } from "mongoose";
import { TaskBin, TaskProp } from "../../types.js";

const SubTasksSchema: Schema = new Schema(
  {
    title: { type: String, trim: true, default: '' },
    body: { type: String, trim: true, default: '' }
  },
  {
    timestamps: true
  }
)

const TaskManagerSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: [true, 'UserId required'], ref: 'users' },
    task: { type: String, required: [true, 'Task body required'] },
    completed: { type: Boolean, default: false },
    edited: { type: Boolean, default: false },
    subTasks: [SubTasksSchema],
  },
  {
    minimize: false,
    timestamps: true
  }
)

const TaskBinSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: [true, 'UserId required']},
    taskBin: [TaskManagerSchema],
  },
  {
    minimize: false,
    timestamps: true
  }
)

export const TaskManagerModel = model<TaskProp>('taskManager', TaskManagerSchema)
export const TaskBinModel = model<TaskBin>('taskBin', TaskBinSchema)
