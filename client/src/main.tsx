import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import { PostDataProvider } from './context/BlogContext.tsx'
import './index.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { preload } from 'swr'
import { posts_endPoint as cacheKey, getPosts, postAxios } from './api/axiosPost.ts'
import { ThemeDataProvider } from './context/ThemeProvider.tsx'
import AuthenticationContext from './context/AuthenticationContext.tsx'
import { store } from './app/store.ts'
import { Provider } from 'react-redux'
import { PostType } from './posts';
import { usersApiSlice } from './app/api/usersApiSlice.ts'

store.dispatch(usersApiSlice.endpoints.getUsers.initiate())
preload(cacheKey, getPosts)
preload(cacheKey, async(): Promise<PostType[]> => {
  const res = await postAxios.get(`${cacheKey}/category?category=General`)
  return res?.data?.data
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeDataProvider>
        <AuthenticationContext>
          <PostDataProvider>
            <Router>
              <Routes>
                <Route path='/*' element={<App />} />
              </Routes>
            </Router>
          </PostDataProvider>
        </AuthenticationContext>
      </ThemeDataProvider>
    </Provider>
  </React.StrictMode>,
  // <React.StrictMode>
  //   <ThemeDataProvider>
  //     <AuthenticationContext>
  //       <PostDataProvider>
  //         <Router>
  //           <Routes>
  //             <Route path='/*' element={<App />} />
  //           </Routes>
  //         </Router>
  //       </PostDataProvider>
  //     </AuthenticationContext>
  //   </ThemeDataProvider>
  // </React.StrictMode>,
)
