import { UserProps } from '../../types/data';
import { RootState } from '../../app/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type PermissionType = 'ALLOWED' | 'FORBIDDEN' | 'AUTHENTICATING'
interface Permission{
  permission: PermissionType,
  user: Partial<UserProps>
}

const userSlice = createSlice({
  name: 'user',
  initialState: { permission: 'AUTHENTICATING', user: {} } as Permission,
  reducers: {
    setGrantedPermission: (state, action: PayloadAction<PermissionType>) => {
      state.permission = action?.payload
    },
    setLoggedInUser: (state, action: PayloadAction<Partial<UserProps>>) => {
      state.user = action.payload
    },
    setLogout: (state) => {
      state.user = {}
      state.permission = 'AUTHENTICATING'
    }
  }
})

export const { setGrantedPermission, setLoggedInUser, setLogout } = userSlice.actions
export const grantedPermission = (state: RootState) => state.user.permission
export const getCurrentUser = (state: RootState) => state.user.user

export default userSlice.reducer
