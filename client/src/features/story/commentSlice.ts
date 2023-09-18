import { RootState } from "../../app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CommentProps, CommentResponseProps } from "../../data";
// import { EntityAdapter, createEntityAdapter, createSelector } from '@reduxjs/toolkit'

// const storyAdapter: EntityAdapter<CommentProps> = createEntityAdapter<CommentProps>({
//   sortComparer: (prev, next) => next.commentDate.localeCompare(prev.commentDate)
// })

// const initialState = storyAdapter.getInitialState({
//   commentLength: 0,
// })

const initialState = {
  comments: [] as CommentProps[],
  editComment: {} as CommentProps,
  responses: [] as CommentResponseProps[],
  editResponse: {} as CommentResponseProps
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
    },
    setAllResponses: (state, action: PayloadAction<CommentResponseProps[]>) => {
      state.responses = action.payload
    },
    setEditResponse: (state, action: PayloadAction<CommentResponseProps>) => {
      state.editResponse = action.payload
    }
  }
})

export const { setAllComments, setEditComment, setEditResponse, setAllResponses } = commentSlice.actions

export const getComments = (state: RootState) => state.comment.comments
export const getEditComments = (state: RootState) => state.comment.editComment

export const getResponses = (state: RootState) => state.comment.responses
export const getEditResponse = (state: RootState) => state.comment.editResponse

export default commentSlice.reducer

