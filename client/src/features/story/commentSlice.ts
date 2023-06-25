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
  comments: [] as CommentProps[],
  editComment: {} as CommentProps
}

const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    setAllComments: (state, action: PayloadAction<CommentProps[]>) => {
      state.comments = action.payload
    },
    setEditComment: (state, action: PayloadAction<CommentProps>) => {
      state.editComment = action.payload
    }
  }
})

export const { setAllComments, setEditComment } = commentSlice.actions
export const getComments = (state: RootState) => state.comment.comments
export const getEditComments = (state: RootState) => state.comment.editComment

export default commentSlice.reducer

