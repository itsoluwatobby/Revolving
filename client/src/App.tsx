import About from "./pages/About";
import { USERROLES } from "./data";
import { Home } from "./pages/Home";
import Welcome from "./layouts/Welcome";
import NotFound from "./pages/NotFound";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import AdminPage from "./pages/AdminPage";
import Followers from "./pages/Followers";
import { Theme, ThemeContextType } from "./posts";
import { OTPEntry } from "./pages/OTPEntry";
import { NewStory } from "./pages/NewStory";
import LoginModal from "./pages/LoginModal";
import ProfilePage from "./pages/ProfilePage";
import NewPassword from "./pages/NewPassword";
import TaskManager from "./pages/TaskManager";
import { BsChatTextFill } from 'react-icons/bs';
import RegisterModal from "./pages/RegisterModel";
import Subscriptions from "./pages/Subscriptions";
import { BlogLayout } from "./layouts/BlogLayout";
import { connect, Socket } from 'socket.io-client';
import ExpensePlanner from "./pages/ExpensePlanner";
import ChatModal from "./pages/chatAdmin/ChatModal";
import { SOCKET_BASE_URL } from './app/api/apiSlice';
import SingleStoryPage from "./pages/SingleStoryPage";
import EditProfilePage from "./pages/EditProfilePage";
import Notifications from "./components/Notifications";
import PrompLogin from "./components/modals/PrompLogin";
import { useCallback, useState, useEffect } from 'react';
import { ProtectedRoute } from "./layouts/ProtectedRoute";
import { useThemeContext } from "./hooks/useThemeContext";
import { PersistedLogin } from "./layouts/PersistedLogin";
import TypewriterEffect from './components/TypewriterEffect';
import { Routes, Route, useLocation } from 'react-router-dom';
import { selectCurrentRoles } from "./features/auth/authSlice";
// import { GiStarShuriken, GiStarSwirl, GiStarsStack } from 'react-icons/gi';

let socket: Socket
export const App = () => {
  const { pathname } = useLocation()
  const {theme, openChat, setOpenChat, loginPrompt} = useThemeContext() as ThemeContextType;
  const user_roles = useSelector(selectCurrentRoles) as USERROLES[]
  const userId = localStorage.getItem('revolving_userId') as string
  const [startTypewriting, setStartTypewriting] = useState<'BEGIN' | 'END'>('END')

  // const designClass = useCallback((theme: Theme, index: number) => {
  //   const FIRST=[1,2,3,4], SECOND=[5,6,7,8,9], THIRD=[10,11,12,13]
  //   return (`
  //     absolute opacity-50 ${FIRST.includes(index) ? `top-${index*20} right-${index*16}` : THIRD.includes(index) ? `bottom-${index*4} left-${index*4}` : SECOND.includes(index) && ''} text-sm
  //   `)
  // }, [])

  const exclude = ['/signIn', '/signUp', '/new_password', '/otp']
  
  useEffect(() => {
    let isMounted = true
    if(isMounted && userId){
      socket = connect(SOCKET_BASE_URL)
      socket.on('connect', () => {
        socket.emit('revolving', 'REVOLVING_APP_ID')
      })
    }
    return () => {
      isMounted = false
    }
  }, [userId])

  const openChatModal = () => {
    if(!userId) setStartTypewriting(prev => (prev === 'END' ? 'BEGIN' : 'END'))
    else {
      setOpenChat('Open')
      setStartTypewriting('END')
    }
  }

  return (
    <main className={`app scroll_behavior relative ${theme == 'light' ? 'bg-white' : 'dark:bg-slate-950 text-white'} h-screen w-full transition-all font-sans overflow-x-hidden`}>
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
            <Route path="profile/:userId" element={<ProfilePage />} />
            <Route path="follows/:userId" element={<Followers />} />
            {/* <Route path="notifications/:userId" element={<Notifications />} /> */}

            <Route element={<ProtectedRoute roles={user_roles}/>}>

              <Route path="adminPage/:userId" element={<AdminPage />} />
              <Route path="subscriptions/:userId" element={<Subscriptions />} />
              <Route path="taskManager/:userId" element={<TaskManager />} />
              <Route path="edit_profile/:userId" element={<EditProfilePage />} />
              <Route path="expensePlanner/:userId" element={<ExpensePlanner />} />
            
            </Route>
            
          </Route>
          
          <Route path="about" element={<About />} />
        
        </Route>
      
        <Route path="*" element={<NotFound />} />
      
      </Routes>

      <Notifications />

      <Toaster />
      {/* {[...Array(4).keys()].map((index) => <GiStarsStack className={designClass(theme, index)} />)}
      {[...Array(5).keys()].map((index) => <GiStarShuriken className={designClass(theme, index+4)} />)}
      {[...Array(4).keys()].map((index) => <GiStarSwirl className={designClass(theme, index+9)} />)} */}
      {
        openChat === 'Open' ?
          // userId ?
          <ChatModal socket={socket} />
        :  
         (
            !exclude.includes(pathname) ? 
              <BsChatTextFill
                title='Chats'
                onClick={openChatModal}
                className={`fixed bottom-4 right-3 text-4xl cursor-pointer text-gray-700 opacity-95 transition-all ease-in-out hover:text-gray-900  hover:scale-[1.03] active:scale-[1] ${theme == 'light' ? '' : ''}`}
              />
            : null
         )
      }
      <div 
        onClick={() => setStartTypewriting('END')}
        className={`fixed bottom-4 right-3 text-3xl bg-slate-800 rounded-md p-1 w-[17rem] font-medium ${(startTypewriting === 'BEGIN') ? 'scale-100' : 'scale-0'} transition-all`}>
          <TypewriterEffect delay={0.25} start={startTypewriting} />
      </div>
      {loginPrompt?.opened == 'Open' ? <PrompLogin /> : null}
    </main>
  )
}
