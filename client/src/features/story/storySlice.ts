import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { ImageUrlsType, PostType } from "../../posts";

const initialState = {
  storyData: {} as Partial<PostType>,
  url: [] as ImageUrlsType[],
  loading: false
}

const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
    setStoryData: (state, action: PayloadAction<Partial<PostType>>) => {
      state.storyData = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setUrl: (state, action: PayloadAction<ImageUrlsType>) => {
      state.url.push(action.payload)
    },
    resetUrl: (state) => {
      state.url = []
    }
  }
})

export const { setStoryData, setUrl, resetUrl, setLoading } = storySlice.actions
export const getStoryData = (state: RootState) => state.story.storyData
export const getUrl = (state: RootState) => state.story.url
export const getLoading = (state: RootState) => state.story.loading

export default storySlice.reducer

