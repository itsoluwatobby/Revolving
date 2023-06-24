import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import { PostDataProvider } from './context/BlogContext.tsx'
import './index.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeDataProvider } from './context/ThemeProvider.tsx'
import AuthenticationContext from './context/AuthenticationContext.tsx'
import { store } from './app/store.ts';
import { Provider } from 'react-redux';
import { usersApiSlice } from './app/api/usersApiSlice.ts';
import { storyApiSlice } from './app/api/storyApiSlice.ts';

store.dispatch(usersApiSlice.endpoints.getUsers.initiate())
store.dispatch(storyApiSlice.endpoints.getStoriesByCategory.initiate('General'))

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
