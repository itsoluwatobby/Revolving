// import { createSlice } from '@reduxjs/toolkit'
// import { RootState } from '../../app/store'

// const userSlice = createSlice({
//   name: 'user',
//   initialState: { persistedLogin: false },
//   reducers: {
//     persistLogin: (state, action) => {
//       state.persistedLogin = action?.payload
//       localStorage.setItem('persist-login', JSON.stringify(state.persistedLogin))
//     }
//   }
// })

// export const { persistLogin } = userSlice.actions
// export const persisted = (state: RootState) => state.user.persistedLogin

// export default userSlice.reducer