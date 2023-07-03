import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { EditTaskOption, TaskProp } from "../../data";

type TaskEntry = {
  task: Partial<TaskProp>,
  option: EditTaskOption
}
const initialState = {
  // commentLength: 0,
  initState: { 
    task: {} as Partial<TaskProp>,
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
    // createTask: (state, action: PayloadAction<Partial<TaskProp>>) => {
    //   state.task = action.payload
    // }
  }
})

export const { setTask } = taskManagerSlice.actions
export const getTask = (state: RootState) => state.task.initState

export default taskManagerSlice.reducer

