import { Home } from "./pages/Home"
import backgroundImage from "../images/bg_image2.jpg"
import { useThemeContext } from "./hooks/useThemeContext"
import { ThemeContextType } from "./posts";
import { Routes, Route } from 'react-router-dom';
import { BlogLayout } from "./components/BlogLayout";
import { NewStory } from "./components/NewStory";
 
export const App = () => {
  const {theme} = useThemeContext() as ThemeContextType;

  return (
    <main className={`${theme == 'light' ? '' : 'dark:bg-slate-800 text-white'} h-screen w-full font-sans overflow-x-hidden`}>
      <Routes>
        <Route path='/' element={<BlogLayout />}>
          <Route index element={<Home />} />
          <Route path="new_story" element={<NewStory />} />
          <Route path="edit_story/:postId" element={<NewStory />} />
        </Route>
      </Routes>
    </main>
  )
}
