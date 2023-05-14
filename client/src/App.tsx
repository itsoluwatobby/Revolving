import { Home } from "./pages/Home"
import { useThemeContext } from "./hooks/useThemeContext"
import { ThemeContextType } from "./posts";
import { Routes, Route } from 'react-router-dom';
import { BlogLayout } from "./components/layouts/BlogLayout";
import { NewStory } from "./pages/NewStory";
import NotFound from "./pages/NotFound";
import SingleStoryPage from "./pages/SingleStoryPage";
import Welcome from "./components/layouts/Welcome";
import LoginModal from "./components/modals/LoginModal";
import RegisterModal from "./components/modals/RegisterModel";
import NewPassword from "./pages/NewPassword";

 
export const App = () => {
  const {theme} = useThemeContext() as ThemeContextType;

  return (
    <main className={`${theme == 'light' ? '' : 'dark:bg-slate-800 text-white'} h-screen w-full transition-all duration-300 font-sans overflow-x-hidden`}>
      <Routes>
        <Route path='/' element={<BlogLayout />}>
          <Route path="/" element={<Welcome />}>
            <Route path="signIn" element={<LoginModal />} />
            <Route path="signUp" element={<RegisterModal />} />
            <Route path="new_password" element={<NewPassword />} />
          </Route>
          <Route index element={<Home />} />
          <Route path="new_story" element={<NewStory />} />
          <Route path="edit_story/:postId" element={<NewStory />} />
          <Route path="story/:postId" element={<SingleStoryPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  )
}
