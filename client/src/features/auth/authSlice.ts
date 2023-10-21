import { AuthType } from "../../types/data";
import { RootState } from "../../app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserAuthType extends AuthType{
  persistedLogin: boolean
}

const authSlice = createSlice({
  name: 'auth',
  initialState:{_id: '', accessToken: '', roles: [], updatedAt: '', persistedLogin: (JSON.parse(localStorage.getItem('persist-login') as string) as boolean) || false} as UserAuthType,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthType>) => {
      const { _id, accessToken, roles, updatedAt } = action.payload
      state._id = _id
      state.accessToken = accessToken
      state.updatedAt = updatedAt
      state.roles = roles
    },
    signUserOut: (state) => {
      state._id = ''
      state.accessToken = ''
      state.updatedAt = ''
      state.roles = []
    },
    persistLogin: (state, action) => {
      state.persistedLogin = action?.payload
      localStorage.setItem('persist-login', JSON.stringify(state.persistedLogin))
    }
  }
})

export const selectCurrentUser = (state: RootState) => state.auth._id
export const selectCurrentRoles = (state: RootState) => state.auth.roles
export const selectCurrentToken = (state: RootState) => state.auth.accessToken
export const persisted = (state: RootState) => state?.auth?.persistedLogin

export const { setCredentials, signUserOut, persistLogin } = authSlice.actions

export default authSlice.reducer

