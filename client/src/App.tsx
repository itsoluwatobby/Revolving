import { Home } from "./pages/Home"
import { useThemeContext } from "./hooks/useThemeContext"
import { ThemeContextType } from "./posts";
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { BlogLayout } from "./layouts/BlogLayout";
import { NewStory } from "./pages/NewStory";
import NotFound from "./pages/NotFound";
import SingleStoryPage from "./pages/SingleStoryPage";
import Welcome from "./layouts/Welcome";
import LoginModal from "./pages/LoginModal";
import RegisterModal from "./pages/RegisterModel";
import NewPassword from "./pages/NewPassword";
import { Toaster } from "react-hot-toast";
import { PersistedLogin } from "./layouts/PersistedLogin";
import ProfilePage from "./pages/ProfilePage";
import About from "./pages/About";
import { BsChatTextFill } from 'react-icons/bs'
import ChatModal from "./pages/chatAdmin/ChatModal";
import PrompLogin from "./components/modals/PrompLogin";
import TaskManager from "./pages/TaskManager";
import ExpensePlanner from "./pages/ExpensePlanner";
import AdminPage from "./pages/AdminPage";
import { selectCurrentRoles } from "./features/auth/authSlice";
import { ProtectedRoute } from "./layouts/ProtectedRoute";
import { OTPEntry } from "./pages/OTPEntry";
import { useGetUserByIdQuery } from "./app/api/usersApiSlice"
import { useEffect } from "react";
import { setLoggedInUser } from "./features/auth/userSlice";

 
export const App = () => {
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const {theme, openChat, setOpenChat, loginPrompt} = useThemeContext() as ThemeContextType;
  const { data } = useGetUserByIdQuery(currentUserId)
  const dispatch = useDispatch()
  const userRoles = useSelector(selectCurrentRoles)

  useEffect(() => {
    let isMounted = true
    if(isMounted && data){
      dispatch(setLoggedInUser(data))
    }
    return () => {
      isMounted = false
    }
  }, [data, dispatch])
console.log(data)
  return (
    <main className={`app relative ${theme == 'light' ? 'bg-white' : 'dark:bg-slate-800 text-white'} h-screen w-full transition-all duration-300 font-sans overflow-x-hidden`}>
      <Routes>
        <Route path='/' element={<BlogLayout />}>
          
          <Route path="/" element={<Welcome />}>

            <Route path="signIn" element={<LoginModal />} />
            <Route path="signUp" element={<RegisterModal />} />
            <Route path="new_password" element={<NewPassword />} />
            <Route path="otp" element={<OTPEntry />} />
          
          </Route>
          
          <Route element={<PersistedLogin />}>
            
            {/* PROTECTED */}
            <Route index element={<Home />} />
            <Route path="story/:storyId" element={<SingleStoryPage />} />
            <Route path="new_story" element={<NewStory />} />
            <Route path="edit_story/:storyId" element={<NewStory />} />

            <Route element={<ProtectedRoute roles={userRoles}/>}>

              <Route path="profile/:userId" element={<ProfilePage />} />
              <Route path="taskManager/:userId" element={<TaskManager />} />
              <Route path="expensePlanner/:userId" element={<ExpensePlanner />} />
              <Route path="adminPage/:userId" element={<AdminPage />} />
            
            </Route>
            
          </Route>
          
          <Route path="about" element={<About />} />
        
        </Route>
      
        <Route path="*" element={<NotFound />} />
      
      </Routes>
      <Toaster />
      {openChat === 'Open' ?
        <ChatModal />
        :  
        <BsChatTextFill
          title='Chat with Admin'
          onClick={() => setOpenChat('Open')}
          className={`fixed bottom-4 right-3 text-4xl cursor-pointer text-gray-700 opacity-95 transition-all ease-in-out hover:text-gray-900  hover:scale-[1.03] active:scale-[1] ${theme == 'light' ? '' : ''}`}
        />
      }
      {loginPrompt == 'Open' ? <PrompLogin /> : null}
    </main>
  )
}
