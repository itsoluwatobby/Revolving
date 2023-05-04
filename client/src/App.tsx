import { Home } from "./page/Home"
import backgroundImage from "../images/bg_image2.jpg"
import { useThemeContext } from "./hooks/useThemeContext"
import { ThemeContextType } from "./posts";
import { Navbar } from "./components/Navbar";
import { Routes, Route } from 'react-router-dom';
import { BlogLayout } from "./components/BlogLayout";
import { NewStory } from "./components/NewStory";
 
//data-theme = {'light'}
// const color: {"dark": string} = {
//   "dark": "bg-slate-800"
// }
export const App = () => {
  const {theme} = useThemeContext() as ThemeContextType;

  return (
    <main className={`${theme == 'light' ? '' : 'dark:bg-slate-800 text-white'} h-screen w-full font-sans overflow-x-hidden`}>
      <Routes>
        <Route path='/' element={<BlogLayout />}>
          <Route index element={<Home />} />
          <Route path="new_story" element={<NewStory />} />
        </Route>
      </Routes>
    </main>
  )
}
