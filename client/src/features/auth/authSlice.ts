import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthType } from "../../data";
import { RootState } from "../../app/store";

interface UserAuthType extends AuthType{
  persistedLogin: boolean
}

const authSlice = createSlice({
  name: 'auth',
  initialState:{_id: '', accessToken: '', roles: [], persistedLogin: (JSON.parse(localStorage.getItem('persist-login') as string) as boolean) || false} as UserAuthType,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthType>) => {
      const { _id, accessToken, roles } = action.payload
      state._id = _id
      state.accessToken = accessToken
      state.roles = roles
    },
    signUserOut: (state) => {
      state._id = ''
      state.accessToken = ''
      state.roles = []
      //localStorage.setItem('persist-login', 'false')
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

export const { setCredentials, signUserOut, persistLogin } = authSlice.actions

export default authSlice.reducer

