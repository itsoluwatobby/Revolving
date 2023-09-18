import { RootState } from "../../app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  presentLanguage: '' as string,
  languages: [] as string[]
}

const codeSlice = createSlice({
  name: 'code',
  initialState,
  reducers: {
    setPresentLanguage: (state, action: PayloadAction<string>) => {
      state.presentLanguage = action.payload
      if(!state.languages.includes(action.payload)){
        state.languages.push(action.payload)
      }
      else return
    }
  }
})

export const { setPresentLanguage } = codeSlice.actions
export const getLanguages = (state: RootState) => state.code.languages

export default codeSlice.reducer