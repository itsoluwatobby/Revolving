import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import { PostDataProvider } from './context/BlogContext.tsx'
import './index.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { preload } from 'swr'
import { posts_endPoint as cacheKey, getPosts } from './api/axiosPost.ts'
import { ThemeDataProvider } from './context/ThemeProvider.tsx'
import AuthenticationContext from './context/AuthenticationContext.tsx'
import WindowContextProvider from './context/WindowContext.tsx'

preload(cacheKey, getPosts)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeDataProvider>
      <AuthenticationContext>
        <WindowContextProvider>
          <PostDataProvider>
            <Router>
              <Routes>
                <Route path='/*' element={<App />} />
              </Routes>
            </Router>
          </PostDataProvider>
        </WindowContextProvider>
      </AuthenticationContext>
    </ThemeDataProvider>
  </React.StrictMode>,
)
