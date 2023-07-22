import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './api/apiSlice';
import authReducer from '../features/auth/authSlice'
import commentReducer from '../features/story/commentSlice'
import navigationTabReducer from '../features/story/navigationSlice';
import storyReducer from '../features/story/storySlice';
import codeReducer from '../features/story/codeSlice';
import taskReducer from '../features/story/taskManagerSlice';
import chatReducer from '../features/chat/chatSlice';
import userReducer from '../features/auth/userSlice'

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    comment: commentReducer,
    navigate: navigationTabReducer,
    story: storyReducer,
    chat: chatReducer,
    code: codeReducer,
    task: taskReducer,
    user: userReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = ReturnType<typeof store.dispatch>
