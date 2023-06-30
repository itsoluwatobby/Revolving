import { useState } from "react";
import { LeftSection } from "../components/LeftSection";
import { Posts } from "../components/home/Posts"
import RightSection from "../components/home/RightSection";
import { TopHome } from "../components/home/TopHome"
import { useThemeContext } from "../hooks/useThemeContext";
import { ChatOption, ThemeContextType } from "../posts";

export const Home = () => {
  const { setRollout, theme } = useThemeContext() as ThemeContextType
 
  return (
    <main className="relative h-full w-full">
      <div className={`md:max-w-full flex`}>
        <div 
          onClick={() => setRollout(false)}
          className="flex-grow flex flex-col h-fit gap-3 md:w-full min-w-[80%]">
          <TopHome />
          <Posts />
        </div>
        <aside className="mt-4 flex-grow hidden md:flex w-1/3 h-full border border-b-0 border-l-slate-300 border-slate-600">
          <RightSection />
        </aside>
      </div>
    </main>
  )
}
// min-w-[80%]