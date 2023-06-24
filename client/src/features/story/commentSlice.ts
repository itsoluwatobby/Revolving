import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { CommentProps } from "../../data";
// import { EntityAdapter, createEntityAdapter, createSelector } from '@reduxjs/toolkit'

// const storyAdapter: EntityAdapter<CommentProps> = createEntityAdapter<CommentProps>({
//   sortComparer: (prev, next) => next.commentDate.localeCompare(prev.commentDate)
// })

// const initialState = storyAdapter.getInitialState({
//   commentLength: 0,
// })

const initialState = {
  // commentLength: 0,
  comments: [] as CommentProps[] 
}

const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    setAllComments: (state, action: PayloadAction<CommentProps[]>) => {
      state.comments = action.payload
    }
  }
})

export const { setAllComments } = commentSlice.actions
export const getComments = (state: RootState) => state.comment.comments

export default commentSlice.reducer

