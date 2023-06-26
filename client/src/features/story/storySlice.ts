import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { CommentProps } from "../../data";
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
  storyData: {} as Partial<PostType> 
}

const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
    setStoryData: (state, action: PayloadAction<Partial<PostType>>) => {
      state.storyData = action.payload
    }
  }
})

export const { setStoryData } = storySlice.actions
export const getStoryData = (state: RootState) => state.story.storyData

export default storySlice.reducer

