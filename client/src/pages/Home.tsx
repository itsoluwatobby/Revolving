import { Footer } from "../components/Footer";
import { } from 'react-icons/io';
import { Posts } from "../components/Posts"
import { TopHome } from "../components/TopHome"
import useAuthenticationContext from "../hooks/useAuthenticationContext";
import { useThemeContext } from "../hooks/useThemeContext";
import { ThemeContextType } from "../posts";
import { Components, NAVIGATE } from "../assets/navigator";
import { useState } from "react";
import { AuthenticationContextType } from "../data";


export const Home = () => {
  const { auth } = useAuthenticationContext() as AuthenticationContextType
  const { setRollout } = useThemeContext() as ThemeContextType
  const [navigationTab, setNavigationTab] = useState<Components>(localStorage.getItem('NAVIGATE') as Components || NAVIGATE.GENERAL);
  
  return (
    <main className="relative h-full">
      <div className="md:max-w-full flex pr-3 pl-3 h-full">
        <div 
          onClick={() => setRollout(false)}
          className="flex-grow flex flex-col h-fit gap-3 md:w-fit min-w-[80%]">
          <TopHome 
            navigationTab={navigationTab}
            setNavigationTab={setNavigationTab}
          />
          <Posts navigationTab={navigationTab} />
        </div>
        <aside className="flex-none hidden md:flex w-1/4 h-full border border-l-slate-300">
        </aside>
      </div>
    </main>
  )
}
