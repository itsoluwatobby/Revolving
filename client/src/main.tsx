import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import { PostDataProvider } from './context/BlogContext.tsx'
import './index.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { preload } from 'swr'
import { posts_endPoint as cacheKey, getPosts } from './api/axiosPost.ts'
import { ThemeDataProvider } from './context/ThemeProvider.tsx'

preload(cacheKey, getPosts)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeDataProvider>  
      <PostDataProvider>
        <Router>
          <Routes>
            <Route path='/*' element={<App />} />
          </Routes>
        </Router>
      </PostDataProvider>
    </ThemeDataProvider>
  </React.StrictMode>,
)
