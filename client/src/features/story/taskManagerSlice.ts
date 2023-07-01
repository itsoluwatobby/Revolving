import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { CommentProps, TaskProp } from "../../data";
import { PostType } from "../../posts";
// import { EntityAdapter, createEntityAdapter, createSelector } from '@reduxjs/toolkit'

// const storyAdapter: EntityAdapter<CommentProps> = createEntityAdapter<CommentProps>({
//   sortComparer: (prev, next) => next.commentDate.localeCompare(prev.commentDate)
// })

// const initialState = storyAdapter.getInitialState({
//   commentLength: 0,
// })

const initialState = {
  // commentLength: 0,
  task: {} as Partial<TaskProp> 
}

const taskManagerSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setTask: (state, action: PayloadAction<Partial<TaskProp>>) => {
      state.task = action.payload
    },
    // createTask: (state, action: PayloadAction<Partial<TaskProp>>) => {
    //   state.task = action.payload
    // }
  }
})

export const { setTask } = taskManagerSlice.actions
export const getTask = (state: RootState) => state.task.task

export default taskManagerSlice.reducer

