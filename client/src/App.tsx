import About from "./pages/About";
import { USERROLES } from "./data";
import { Home } from "./pages/Home";
import Welcome from "./layouts/Welcome";
import NotFound from "./pages/NotFound";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import AdminPage from "./pages/AdminPage";
import Followers from "./pages/Followers";
import { ThemeContextType } from "./posts";
import { OTPEntry } from "./pages/OTPEntry";
import { NewStory } from "./pages/NewStory";
import LoginModal from "./pages/LoginModal";
import ProfilePage from "./pages/ProfilePage";
import NewPassword from "./pages/NewPassword";
import TaskManager from "./pages/TaskManager";
import { BsChatTextFill } from 'react-icons/bs';
import { Routes, Route } from 'react-router-dom';
import RegisterModal from "./pages/RegisterModel";
import Subscriptions from "./pages/Subscriptions";
import { BlogLayout } from "./layouts/BlogLayout";
import ExpensePlanner from "./pages/ExpensePlanner";
import ChatModal from "./pages/chatAdmin/ChatModal";
import SingleStoryPage from "./pages/SingleStoryPage";
import EditProfilePage from "./pages/EditProfilePage";
import PrompLogin from "./components/modals/PrompLogin";
import { useThemeContext } from "./hooks/useThemeContext";
import { PersistedLogin } from "./layouts/PersistedLogin";
import { ProtectedRoute } from "./layouts/ProtectedRoute";
import { selectCurrentRoles } from "./features/auth/authSlice";
 
export const App = () => {
  const {theme, openChat, setOpenChat, loginPrompt} = useThemeContext() as ThemeContextType;
  const user_roles = useSelector(selectCurrentRoles) as USERROLES[]

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
            <Route path="profile/:userId" element={<ProfilePage />} />
            <Route path="follows/:userId" element={<Followers />} />

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
