import { Posts } from "../components/home/Posts"
// import RightSection from "../components/home/RightSection";
import { TopHome } from "../components/home/TopHome"
import { useThemeContext } from "../hooks/useThemeContext";
import { ThemeContextType } from "../posts";

export const Home = () => {
  const { setRollout } = useThemeContext() as ThemeContextType
 
  return (
    <main 
      onClick={() => setRollout(false)}
      className="relative h-full w-full flex flex-col gap-2">
      <TopHome />
      <Posts />
      {/* <div className={`md:max-w-full flex`}>
        <div 
          onClick={() => setRollout(false)}
          className="flex-auto flex flex-col h-fit gap-3 md:w-full maxscreen:w-1/2 mt-1.5">
          <TopHome />
          <Posts />
        </div> */}
        {/* <aside className="flex-none mt-4 hidden lg:flex h-full border border-b-0 border-t-0 border-l-slate-300">
          <RightSection />
        </aside> */}
      {/* </div> */}
    </main>
  )
}
// min-w-[80%]

// TODO: CREATE A CARD TO PREVIEW USER DETAILS
