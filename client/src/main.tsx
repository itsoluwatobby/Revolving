import './index.css';
import React from 'react';
import { App } from './App.tsx';
import { store } from './app/store.ts';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import { usersApiSlice } from './app/api/usersApiSlice.ts';
import { storyApiSlice } from './app/api/storyApiSlice.ts';
import { PostDataProvider } from './context/BlogContext.tsx';
import { ThemeDataProvider } from './context/ThemeProvider.tsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

store.dispatch(usersApiSlice.endpoints.getUsers.initiate())
store.dispatch(storyApiSlice.endpoints.getStoriesByCategory.initiate('General'))

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeDataProvider>
        <PostDataProvider>
          <Router>
            <Routes>
              <Route path='/*' element={<App />} />
            </Routes>
          </Router>
        </PostDataProvider>
      </ThemeDataProvider>
    </Provider>
  </React.StrictMode>
)
