import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthType } from "../../data";
import { RootState } from "../../app/store";

interface UserAuthType extends AuthType{
  persistedLogin: boolean
}

const authSlice = createSlice({
  name: 'auth',
  initialState:{_id: '', accessToken: '', roles: [], persistedLogin: false} as UserAuthType,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthType>) => {
      const { _id, accessToken, roles } = action.payload
      state._id = _id
      state.accessToken = accessToken
      state.roles = roles
    },
    signOut: (state) => {
      state._id = ''
      state.accessToken = ''
      state.roles = []
      localStorage.removeItem('persist-login')
    },
    persistLogin: (state, action) => {
      state.persistedLogin = action?.payload
      localStorage.setItem('persist-login', JSON.stringify(state.persistedLogin))
    }
  }
})

export const selectCurrentUser = (state: RootState) => state.auth._id
export const selectCurrentToken = (state: RootState) => state.auth.accessToken
export const persisted = (state: RootState) => state?.auth?.persistedLogin

export const { setCredentials, signOut, persistLogin } = authSlice.actions

export default authSlice.reducer



