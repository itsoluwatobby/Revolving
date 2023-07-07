import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { EditTaskOption, TaskProp } from "../../data";

type TaskEntry = {
  taskId: string,
  option: EditTaskOption
}
const initialState = {
  tasks: [] as TaskProp[],
  initState: { 
    taskId: {} as string,
    option: '' as EditTaskOption
  }
}

const taskManagerSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setTask: (state, action: PayloadAction<TaskEntry>) => {
      state.initState = action.payload
    },
    setAllTasks: (state, action: PayloadAction<TaskProp[]>) => {
      state.tasks = action.payload
    }
  }
})

export const { setTask, setAllTasks } = taskManagerSlice.actions
export const getTask = (state: RootState) => state.task.initState

export const singleTask = (state: RootState, taskId: string) => {
  const task = state?.task?.tasks?.find(task => task._id === taskId)
  return task
}
export default taskManagerSlice.reducer

