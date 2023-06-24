import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Components, NAVIGATE } from "../../utils/navigator";

const initialState = {
  navigationTab: localStorage.getItem('NAVIGATE') as Components || NAVIGATE.GENERAL
}

const navigationSlice = createSlice({
  name: 'navigate',
  initialState,
  reducers: {
    setNavigation: (state, action: PayloadAction<Components>) => {
      state.navigationTab = action.payload
    }
  }
})

export const getTabCategory = (state: RootState) => state.navigate.navigationTab
export const { setNavigation } = navigationSlice.actions

export default navigationSlice.reducer
