import { apiSlice } from './api/apiSlice';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/auth/userSlice';
import authReducer from '../features/auth/authSlice';
import codeReducer from '../features/story/codeSlice';
import storyReducer from '../features/story/storySlice';
import { setupListeners } from '@reduxjs/toolkit/query';
import commentReducer from '../features/story/commentSlice';
import taskReducer from '../features/story/taskManagerSlice';
import navigationTabReducer from '../features/story/navigationSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    comment: commentReducer,
    navigate: navigationTabReducer,
    story: storyReducer,
    code: codeReducer,
    task: taskReducer,
    user: userReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: false
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = ReturnType<typeof store.dispatch>
