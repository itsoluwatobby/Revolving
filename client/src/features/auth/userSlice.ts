import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

type PermissionType = 'ALLOWED' | 'FORBIDDEN'
interface Permission{
  permission: PermissionType
}

const userSlice = createSlice({
  name: 'user',
  initialState: { permission: 'FORBIDDEN' } as Permission,
  reducers: {
    setGrantedPermission: (state, action: PayloadAction<PermissionType>) => {
      state.permission = action?.payload
    }
  }
})

export const { setGrantedPermission } = userSlice.actions
export const grantedPermission = (state: RootState) => state.user.permission

export default userSlice.reducer
